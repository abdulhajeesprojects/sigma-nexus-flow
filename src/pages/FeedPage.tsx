
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch posts
      const fetchPosts = async () => {
        try {
          const postsQuery = query(
            collection(firestore, "posts"),
            orderBy("createdAt", "desc"),
            limit(10)
          );
          
          const postsSnapshot = await getDocs(postsQuery);
          const postsData = postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          setPosts(postsData);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchPosts();
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 h-64 animate-pulse"
              ></motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Demo posts for development
  const demoPosts = [
    {
      id: "1",
      author: {
        name: "Sarah Johnson",
        title: "UX Designer at Figma",
        avatar: null,
      },
      content:
        "Just published my case study on redesigning the onboarding experience for our enterprise customers. We saw a 34% increase in completion rate and significantly improved user satisfaction scores. #UXDesign #ProductDesign",
      createdAt: new Date(Date.now() - 3600000),
      likes: 42,
      comments: 7,
      shares: 3,
    },
    {
      id: "2",
      author: {
        name: "Michael Chen",
        title: "Full Stack Developer",
        avatar: null,
      },
      content:
        "Excited to share that our team just open-sourced our React component library! It includes 50+ accessible components with beautiful animations. Check it out and let me know what you think! #React #OpenSource #WebDevelopment",
      createdAt: new Date(Date.now() - 7200000),
      likes: 89,
      comments: 21,
      shares: 15,
    },
    {
      id: "3",
      author: {
        name: "Emma Rodriguez",
        title: "Product Manager",
        avatar: null,
      },
      content:
        "Looking for recommendations on project management tools that integrate well with Figma and Slack. Our team is growing and we need something scalable that won't slow us down. Any suggestions? #ProductManagement #Tools",
      createdAt: new Date(Date.now() - 10800000),
      likes: 17,
      comments: 31,
      shares: 2,
    },
  ];

  return (
    <div className="min-h-screen pt-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Create Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-4 mb-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue font-bold">
                {auth.currentUser?.displayName?.charAt(0) || "U"}
              </div>
              <div
                className="bg-secondary/50 dark:bg-secondary/20 rounded-full py-2 px-4 text-muted-foreground flex-1 cursor-pointer hover:bg-secondary/80 dark:hover:bg-secondary/30 transition-colors"
                onClick={() => alert("Create post feature coming soon!")}
              >
                What's on your mind?
              </div>
            </div>
            <div className="flex justify-between">
              <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <span>Photo</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <span>Video</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
                <span>Tag</span>
              </button>
              <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                <span>Event</span>
              </button>
            </div>
          </motion.div>

          {/* Posts */}
          <div className="space-y-6">
            {demoPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-sigma-purple/20 flex items-center justify-center text-sigma-purple font-bold">
                    {post.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{post.author.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {post.author.title} •{" "}
                      {new Date(post.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="whitespace-pre-line">{post.content}</p>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground pb-3 border-b">
                  <span>{post.likes} likes</span>
                  <span>
                    {post.comments} comments • {post.shares} shares
                  </span>
                </div>

                <div className="flex justify-between pt-3">
                  <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                    <span>Like</span>
                  </button>
                  <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                      />
                    </svg>
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 0a2.25 2.25 0 00-3.935 0z"
                      />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                      />
                    </svg>
                    <span>Save</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
