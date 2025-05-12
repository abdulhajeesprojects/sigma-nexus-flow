
// Array of professional cartoon profile images
export const defaultProfileImages = [
  {
    id: 1,
    url: "https://firebasestorage.googleapis.com/v0/b/ah-sigma-hub.appspot.com/o/default-profiles%2Fprofile-1.png?alt=media&token=d9f9f9fc-6fbb-4e10-9e35-9ca4c49752a2",
    alt: "Professional avatar with glasses"
  },
  {
    id: 2,
    url: "https://firebasestorage.googleapis.com/v0/b/ah-sigma-hub.appspot.com/o/default-profiles%2Fprofile-2.png?alt=media&token=e8f8f9fc-6fbb-4e10-9e35-9ca4c49752a2",
    alt: "Business professional with tie"
  },
  {
    id: 3,
    url: "https://firebasestorage.googleapis.com/v0/b/ah-sigma-hub.appspot.com/o/default-profiles%2Fprofile-3.png?alt=media&token=b7f9f9fc-6fbb-4e10-9e35-9ca4c49752a2",
    alt: "Creative professional with colorful background"
  },
  {
    id: 4,
    url: "https://firebasestorage.googleapis.com/v0/b/ah-sigma-hub.appspot.com/o/default-profiles%2Fprofile-4.png?alt=media&token=c6f9f9fc-6fbb-4e10-9e35-9ca4c49752a2",
    alt: "Tech professional with headphones"
  },
  {
    id: 5,
    url: "https://firebasestorage.googleapis.com/v0/b/ah-sigma-hub.appspot.com/o/default-profiles%2Fprofile-5.png?alt=media&token=a5f9f9fc-6fbb-4e10-9e35-9ca4c49752a2",
    alt: "Business casual with blazer"
  },
  {
    id: 6,
    url: "https://firebasestorage.googleapis.com/v0/b/ah-sigma-hub.appspot.com/o/default-profiles%2Fprofile-6.png?alt=media&token=f4f9f9fc-6fbb-4e10-9e35-9ca4c49752a2",
    alt: "Minimalist professional avatar"
  },
  {
    id: 7,
    url: "https://firebasestorage.googleapis.com/v0/b/ah-sigma-hub.appspot.com/o/default-profiles%2Fprofile-7.png?alt=media&token=g3f9f9fc-6fbb-4e10-9e35-9ca4c49752a2",
    alt: "Formal business professional"
  },
  {
    id: 8,
    url: "https://firebasestorage.googleapis.com/v0/b/ah-sigma-hub.appspot.com/o/default-profiles%2Fprofile-8.png?alt=media&token=h2f9f9fc-6fbb-4e10-9e35-9ca4c49752a2",
    alt: "Casual professional with smile"
  },
  {
    id: 9,
    url: "https://firebasestorage.googleapis.com/v0/b/ah-sigma-hub.appspot.com/o/default-profiles%2Fprofile-9.png?alt=media&token=i1f9f9fc-6fbb-4e10-9e35-9ca4c49752a2",
    alt: "Modern professional avatar"
  },
  {
    id: 10,
    url: "https://firebasestorage.googleapis.com/v0/b/ah-sigma-hub.appspot.com/o/default-profiles%2Fprofile-10.png?alt=media&token=j0f9f9fc-6fbb-4e10-9e35-9ca4c49752a2",
    alt: "Executive professional look"
  }
];

export const getRandomDefaultProfileImage = () => {
  const randomIndex = Math.floor(Math.random() * defaultProfileImages.length);
  return defaultProfileImages[randomIndex];
};

export default defaultProfileImages;
