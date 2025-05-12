
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, orderBy, limit, where } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const JobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        // Fetch job listings
        const jobsQuery = query(
          collection(firestore, "jobs"),
          orderBy("postedAt", "desc"),
          limit(10)
        );
        
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setJobs(jobsData);

        // Fetch saved jobs for the current user
        const savedJobsQuery = query(
          collection(firestore, "savedJobs"),
          where("userId", "==", user.uid)
        );
        
        const savedJobsSnapshot = await getDocs(savedJobsQuery);
        const savedJobsData = savedJobsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setSavedJobs(savedJobsData);
      } catch (error) {
        console.error("Error fetching jobs data:", error);
        toast({
          title: "Error",
          description: "Failed to load jobs data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, toast]);

  const handleSaveJob = async (jobId: string) => {
    if (!auth.currentUser) return;
    
    try {
      // In a real app, we would save this to Firestore
      // For now, just update the local state
      const isSaved = savedJobs.some(job => job.jobId === jobId);
      
      if (isSaved) {
        setSavedJobs(prev => prev.filter(job => job.jobId !== jobId));
        toast({
          title: "Job Removed",
          description: "Job has been removed from saved jobs",
        });
      } else {
        const newSavedJob = {
          userId: auth.currentUser.uid,
          jobId: jobId,
          savedAt: new Date(),
        };
        
        setSavedJobs(prev => [...prev, newSavedJob]);
        toast({
          title: "Job Saved",
          description: "Job has been saved to your profile",
        });
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive",
      });
    }
  };

  const handleApplyJob = (jobId: string) => {
    toast({
      title: "Application Started",
      description: "You're being redirected to complete your application",
    });
    navigate(`/jobs/${jobId}/apply`);
  };

  const filteredJobs = searchQuery 
    ? jobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : jobs;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 h-32 animate-pulse"
              ></motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold">Find Your Next Opportunity</h1>
            <Button 
              className="mt-2 md:mt-0 bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
            >
              Post a Job
            </Button>
          </div>
          
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <Input
                type="text"
                placeholder="Search jobs by title, company, or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button 
                className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
              >
                Search
              </Button>
            </div>
          </motion.div>
          
          {/* Saved Jobs */}
          {savedJobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-6 mb-6"
            >
              <h2 className="text-xl font-bold mb-4">Your Saved Jobs</h2>
              <div className="space-y-4">
                {savedJobs.map((savedJob) => {
                  const job = jobs.find(j => j.id === savedJob.jobId);
                  if (!job) return null;
                  
                  return (
                    <div key={savedJob.id} className="border-l-2 border-sigma-blue pl-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="font-medium">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.company} • {job.location}
                          </p>
                        </div>
                        <div className="flex space-x-2 mt-2 md:mt-0">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSaveJob(job.id)}
                          >
                            Remove
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleApplyJob(job.id)}
                            className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
          
          {/* Job Listings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-bold mb-4">
              {searchQuery ? "Search Results" : "Recommended Jobs"}
            </h2>
            
            {filteredJobs.length > 0 ? (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-bold">{job.title}</h3>
                        <p className="text-muted-foreground">
                          {job.company} • {job.location}
                        </p>
                        <p className="text-sm mt-1">{job.description?.substring(0, 150)}...</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.skills?.slice(0, 3).map((skill: string, index: number) => (
                            <span 
                              key={index}
                              className="text-xs bg-secondary/50 dark:bg-secondary/20 px-2 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills?.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 mt-4 md:mt-0">
                        <p className="text-xs text-muted-foreground text-center">
                          {new Date(job.postedAt?.toDate()).toLocaleDateString()}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSaveJob(job.id)}
                          className={savedJobs.some(j => j.jobId === job.id) ? "border-sigma-purple text-sigma-purple" : ""}
                        >
                          {savedJobs.some(j => j.jobId === job.id) ? "Saved" : "Save"}
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleApplyJob(job.id)}
                          className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No jobs found matching your criteria</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
