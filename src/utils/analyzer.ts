import crypto from "crypto"

export function sha256(value: string) {
    return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

export function analyzeString(value: string) {
    const length = value.length;
    const trimmed = value.trim();
    const word_count = trimmed ? trimmed.split(/\s+/).length : 0;
    const charMap: Record<string, number> = {};
    for (const char of value) charMap[char] = (charMap[char] || 0) + 1;
    const unique_characters = Object.keys(charMap).length;
    const low = value.toLowerCase();
    const is_palindrome = low === [...low].reverse().join('');
    const sha = sha256(value);

    return {
        length,
        is_palindrome,
        unique_characters,
        word_count,
        sha256_hash: sha,
        character_frequency_map: charMap
    }
}