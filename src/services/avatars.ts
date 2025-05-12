// Professional avatars using DiceBear's Bottts collection (robot avatars)
const AVATAR_BASE_URL = 'https://api.dicebear.com/7.x/bottts/svg';

// Additional avatar collections for variety
const AVATAR_COLLECTIONS = {
  bottts: 'https://api.dicebear.com/7.x/bottts/svg',
  shapes: 'https://api.dicebear.com/7.x/shapes/svg',
  identicon: 'https://api.dicebear.com/7.x/identicon/svg',
  pixelArt: 'https://api.dicebear.com/7.x/pixel-art/svg',
  avataaars: 'https://api.dicebear.com/7.x/avataaars/svg',
};

export type AvatarType = 'professional' | 'student' | 'kid';
export type AvatarGender = 'male' | 'female' | 'neutral';

/**
 * Get a random avatar URL based on type and gender
 */
export function getRandomAvatar(type: AvatarType = 'professional', gender: AvatarGender = 'neutral'): string {
  const seed = Math.random().toString(36).substring(7);
  const collection = getCollectionForType(type);
  return `${collection}?seed=${seed}&backgroundColor=random`;
}

/**
 * Get a consistent avatar for a user based on their user ID
 */
export function getAvatarForUser(userId: string, type: AvatarType = 'professional', gender: AvatarGender = 'neutral'): string {
  const collection = getCollectionForType(type);
  return `${collection}?seed=${userId}&backgroundColor=random`;
}

/**
 * Get the appropriate avatar collection based on user type
 */
function getCollectionForType(type: AvatarType): string {
  switch (type) {
    case 'professional':
      return AVATAR_COLLECTIONS.bottts;
    case 'student':
      return AVATAR_COLLECTIONS.identicon;
    case 'kid':
      return AVATAR_COLLECTIONS.pixelArt;
    default:
      return AVATAR_COLLECTIONS.bottts;
  }
}

/**
 * Get a random avatar from any collection
 */
export function getRandomAvatarFromAnyCollection(): string {
  const collections = Object.values(AVATAR_COLLECTIONS);
  const randomCollection = collections[Math.floor(Math.random() * collections.length)];
  const seed = Math.random().toString(36).substring(7);
  return `${randomCollection}?seed=${seed}&backgroundColor=random`;
} 