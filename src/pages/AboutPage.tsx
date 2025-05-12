import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-2 sm:p-4">
      <div className="w-full sm:max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
          >
            Building Something Awesome
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-gray-300 text-lg md:text-xl">
              <span className="text-blue-400">const</span> <span className="text-purple-400">aboutPage</span> = <span className="text-yellow-400">async</span> () ={'>'} {'{'}
            </p>
            
            <motion.p 
              className="text-gray-300 text-lg md:text-xl font-mono"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-blue-400">return</span> <span className="text-green-400">"Coming Soon"</span>;
            </motion.p>
            
            <p className="text-gray-300 text-lg md:text-xl">
              {'}'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-8"
          >
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-blue-400"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
