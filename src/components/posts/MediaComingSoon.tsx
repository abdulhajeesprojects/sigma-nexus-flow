
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, VideoIcon } from 'lucide-react';

interface MediaComingSoonProps {
  type: 'image' | 'video';
}

const MediaComingSoon: React.FC<MediaComingSoonProps> = ({ type }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-sigma-blue/10 to-sigma-purple/10 backdrop-blur-sm rounded-lg p-6 flex flex-col items-center justify-center text-center border border-dashed border-secondary"
    >
      <div className="bg-secondary/20 p-4 rounded-full mb-3">
        {type === 'image' ? (
          <Camera className="w-8 h-8 text-sigma-blue dark:text-sigma-purple" />
        ) : (
          <VideoIcon className="w-8 h-8 text-sigma-blue dark:text-sigma-purple" />
        )}
      </div>
      <h3 className="font-medium text-lg mb-1">
        {type === 'image' ? 'Image Sharing' : 'Video Sharing'} Coming Soon
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        We're working hard to bring {type === 'image' ? 'photo' : 'video'} sharing to SigmaHub. 
        Stay tuned for updates!
      </p>
    </motion.div>
  );
};

export default MediaComingSoon;
