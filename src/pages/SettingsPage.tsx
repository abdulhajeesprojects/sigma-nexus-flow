
import React from 'react';
import { motion } from 'framer-motion';
import ProfileSettings from '@/components/profile/ProfileSettings';
import { GlassCard } from '@/components/ui/glass-card';

const SettingsPage = () => {
  return (
    <div className="min-h-screen pt-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          
          <div className="space-y-6">
            <ProfileSettings />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
