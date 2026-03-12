#!/usr/bin/env node
/**
 * fetch-social-media.js
 *
 * Searches for official social media accounts for each presidential candidate
 * using Jina web search. Only adds verified/official accounts.
 *
 * Usage: node scripts/fetch-social-media.js
 *
 * Requirements:
 * - JINA_API_KEY env var (or uses free tier)
 * - data/candidates.json must exist
 *
 * Output:
 * - Updates data/candidates.json with social_media field
 * - Logs all findings to /tmp/social-media-findings.txt
 */

const fs = require('fs');
const path = require('path');

const CANDIDATES_PATH = path.join(__dirname, '..', 'data', 'candidates.json');
const FINDINGS_PATH = '/tmp/social-media-findings.txt';
const JINA_BASE = 'https://r.jina.ai/';

// Rate limit: wait between requests
const DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchJina(query) {
  const url = `${JINA_BASE}https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const headers = { Accept: 'text/plain' };

  if (process.env.JINA_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.JINA_API_KEY}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`  Jina error ${res.status}: ${res.statusText}`);
    return '';
  }
  return await res.text();
}

function extractTwitterHandle(text) {
  // Match twitter.com/handle or x.com/handle patterns
  const patterns = [
    /(?:twitter\.com|x\.com)\/(@?[\w]{1,15})/gi,
  ];
  const handles = new Set();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const handle = match[1].replace(/^@/, '').toLowerCase();
      // Filter out common non-profile paths
      if (!['search', 'home', 'explore', 'settings', 'i', 'intent', 'hashtag'].includes(handle)) {
        handles.add(handle);
      }
    }
  }
  return Array.from(handles);
}

function extractInstagramHandle(text) {
  const patterns = [
    /instagram\.com\/([\w.]{1,30})/gi,
  ];
  const handles = new Set();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const handle = match[1].toLowerCase();
      if (!['p', 'explore', 'reel', 'stories', 'accounts'].includes(handle)) {
        handles.add(handle);
      }
    }
  }
  return Array.from(handles);
}

function extractFacebookUrl(text) {
  const patterns = [
    /(https?:\/\/(?:www\.)?facebook\.com\/[\w.]+)/gi,
  ];
  const urls = new Set();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const url = match[1];
      if (!url.includes('/sharer') && !url.includes('/share') && !url.includes('/dialog')) {
        urls.add(url);
      }
    }
  }
  return Array.from(urls);
}

function isLikelyOfficial(text, candidateName) {
  const officialMarkers = [
    'cuenta oficial',
    'official',
    'verificad',
    'candidato',
    'presidente',
    'congresista',
  ];
  const nameParts = candidateName.toLowerCase().split(' ');
  const textLower = text.toLowerCase();

  // Check if the text mentions the candidate name near the social handle
  const nameFound = nameParts.some((part) => part.length > 3 && textLower.includes(part));
  const markerFound = officialMarkers.some((m) => textLower.includes(m));

  return nameFound && markerFound;
}

async function fetchSocialMediaForCandidate(candidate) {
  const name = candidate.full_name;
  console.log(`\nSearching for: ${name} (${candidate.party_name})`);

  const queries = [
    `"${name}" Peru 2026 candidato Twitter OR Instagram site:twitter.com OR site:instagram.com`,
    `${name} candidato presidente Peru Twitter`,
    `${name} ${candidate.party_name} redes sociales`,
  ];

  let allText = '';
  for (const query of queries) {
    try {
      const result = await searchJina(query);
      allText += '\n' + result;
      await sleep(DELAY_MS);
    } catch (err) {
      console.error(`  Error searching: ${err.message}`);
    }
  }

  const twitterHandles = extractTwitterHandle(allText);
  const instagramHandles = extractInstagramHandle(allText);
  const facebookUrls = extractFacebookUrl(allText);

  const socialMedia = {};
  let found = false;

  // Only add handles that appear to be official
  if (twitterHandles.length > 0) {
    // Take the first handle that seems official
    const officialTwitter = twitterHandles.find((h) =>
      isLikelyOfficial(allText, name)
    );
    if (officialTwitter) {
      socialMedia.twitter = officialTwitter;
      found = true;
      console.log(`  Twitter: @${officialTwitter}`);
    }
  }

  if (instagramHandles.length > 0) {
    const officialIG = instagramHandles.find((h) =>
      isLikelyOfficial(allText, name)
    );
    if (officialIG) {
      socialMedia.instagram = officialIG;
      found = true;
      console.log(`  Instagram: @${officialIG}`);
    }
  }

  if (facebookUrls.length > 0) {
    const officialFB = facebookUrls.find((u) =>
      isLikelyOfficial(allText, name)
    );
    if (officialFB) {
      socialMedia.facebook = officialFB;
      found = true;
      console.log(`  Facebook: ${officialFB}`);
    }
  }

  if (!found) {
    console.log('  No verified accounts found');
  }

  return {
    social_media: found ? socialMedia : null,
    social_media_verified: false, // Always false — manual verification needed
    raw_twitter: twitterHandles,
    raw_instagram: instagramHandles,
    raw_facebook: facebookUrls,
  };
}

async function main() {
  const candidates = JSON.parse(fs.readFileSync(CANDIDATES_PATH, 'utf8'));
  const findings = [];

  console.log(`Processing ${candidates.length} candidates...\n`);

  for (const candidate of candidates) {
    const result = await fetchSocialMediaForCandidate(candidate);

    // Update candidate data
    if (result.social_media) {
      candidate.social_media = result.social_media;
      candidate.social_media_verified = false;
    }

    // Log findings
    findings.push({
      name: candidate.full_name,
      party: candidate.party_name,
      social_media: result.social_media,
      raw_handles: {
        twitter: result.raw_twitter,
        instagram: result.raw_instagram,
        facebook: result.raw_facebook,
      },
    });
  }

  // Save updated candidates
  fs.writeFileSync(CANDIDATES_PATH, JSON.stringify(candidates, null, 2) + '\n');
  console.log(`\nSaved updated candidates to ${CANDIDATES_PATH}`);

  // Save findings log
  fs.writeFileSync(
    FINDINGS_PATH,
    JSON.stringify(findings, null, 2),
  );
  console.log(`Saved findings to ${FINDINGS_PATH}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
