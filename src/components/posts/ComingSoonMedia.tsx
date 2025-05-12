
import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Video } from 'lucide-react';

interface ComingSoonMediaProps {
  type: 'image' | 'video';
}

const ComingSoonMedia: React.FC<ComingSoonMediaProps> = ({ type }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 text-center"
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        {type === 'image' ? (
          <Camera className="h-10 w-10 text-gray-400" />
        ) : (
          <Video className="h-10 w-10 text-gray-400" />
        )}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="font-medium">{type === 'image' ? 'Image' : 'Video'} uploads coming soon</p>
          <p>This feature is currently under development</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ComingSoonMedia;
