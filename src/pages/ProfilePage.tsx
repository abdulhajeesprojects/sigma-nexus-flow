
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        navigate("/auth");
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, "users", authUser.uid));
        
        if (userDoc.exists()) {
          setUser({
            ...userDoc.data(),
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
          });
        } else {
          setUser({
            displayName: authUser.displayName,
            email: authUser.email,
            photoURL: authUser.photoURL,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 animate-pulse h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for profile display
  const mockUser = {
    displayName: user?.displayName || "User Name",
    headline: user?.headline || "Full Stack Developer | React Specialist | UI/UX Enthusiast",
    location: user?.location || "San Francisco, CA",
    connections: 428,
    about:
      user?.bio || "I'm a passionate developer with over 5 years of experience building web applications with React, Node.js, and modern web technologies. I love creating beautiful, user-friendly interfaces and solving complex problems.",
    experience: user?.experience || [
      {
        title: "Senior Frontend Developer",
        company: "TechCorp",
        duration: "Jan 2020 - Present",
        description:
          "Lead frontend development for multiple projects using React, TypeScript, and GraphQL.",
      },
      {
        title: "Frontend Developer",
        company: "WebSolutions Inc.",
        duration: "Mar 2017 - Dec 2019",
        description:
          "Developed responsive web applications and implemented UI improvements.",
      },
    ],
    education: user?.education || [
      {
        school: "University of Technology",
        degree: "Bachelor of Science in Computer Science",
        duration: "2013 - 2017",
      },
    ],
    skills: user?.skills || [
      "React",
      "JavaScript",
      "TypeScript",
      "Node.js",
      "GraphQL",
      "CSS",
      "Tailwind CSS",
      "UI/UX Design",
      "Redux",
      "Jest",
    ],
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 mb-6 relative"
          >
            {/* Cover Image */}
            <div className="h-32 md:h-48 -mx-8 -mt-8 mb-16 bg-gradient-to-r from-sigma-blue/80 to-sigma-purple/80 rounded-t-xl"></div>

            {/* Profile Picture */}
            <div className="absolute top-20 md:top-24 left-8">
              <div className="w-24 h-24 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue text-4xl font-bold border-4 border-background">
                {mockUser.displayName.charAt(0)}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end">
              <div>
                <h1 className="text-2xl font-bold mb-2">{mockUser.displayName}</h1>
                <p className="text-muted-foreground mb-2">{mockUser.headline}</p>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <span>{mockUser.location}</span>
                  <span className="mx-2">•</span>
                  <span className="text-sigma-blue dark:text-sigma-purple">
                    {mockUser.connections} connections
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-4 md:mt-0">
                <Button className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white">
                  Edit Profile
                </Button>
                <Button variant="outline">Share Profile</Button>
              </div>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">About</h2>
            <p className="whitespace-pre-line">{mockUser.about}</p>
          </motion.div>

          {/* Experience Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Experience</h2>
            <div className="space-y-6">
              {mockUser.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                  <h3 className="font-bold">{exp.title}</h3>
                  <p className="text-muted-foreground">
                    {exp.company} • {exp.duration}
                  </p>
                  <p className="mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Education Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-8 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Education</h2>
            <div className="space-y-6">
              {mockUser.education.map((edu: any, index: number) => (
                <div key={index} className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                  <h3 className="font-bold">{edu.school}</h3>
                  <p className="text-muted-foreground">
                    {edu.degree} • {edu.duration}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-8"
          >
            <h2 className="text-xl font-bold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {mockUser.skills.map((skill: string, index: number) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-secondary/50 dark:bg-secondary/20 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
