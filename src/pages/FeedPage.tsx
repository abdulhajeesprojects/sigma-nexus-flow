
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  startAfter,
  QueryDocumentSnapshot, 
  DocumentData,
  onSnapshot
} from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import CreatePost from "@/components/posts/CreatePost";
import PostItem from "@/components/posts/PostItem";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: any;
  author?: {
    displayName: string;
    headline?: string;
    photoURL?: string;
  };
}

const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const postsPerPage = 5;

  // Set up real-time listener for posts
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    setLoading(true);
    
    // Create query for fetching posts in real-time
    const postsQuery = query(
      collection(firestore, "posts"),
      orderBy("createdAt", "desc"),
      limit(postsPerPage)
    );
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      try {
        // Set the last document for pagination
        const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        
        if (snapshot.empty) {
          setPosts([]);
          setNoMorePosts(true);
          setLoading(false);
          return;
        }
        
        // Get user data for each post
        const postsWithAuthor = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const postData = doc.data() as Omit<Post, 'id'>;
            const post: Post = { 
              id: doc.id,
              userId: postData.userId,
              content: postData.content,
              imageUrl: postData.imageUrl,
              likes: postData.likes,
              comments: postData.comments,
              shares: postData.shares,
              createdAt: postData.createdAt,
            };
            
            // Get author data
            try {
              const userDoc = await getDocs(
                query(collection(firestore, "users"), where("userId", "==", post.userId))
              );
              
              if (!userDoc.empty) {
                const userData = userDoc.docs[0].data();
                post.author = {
                  displayName: userData.displayName || "Unknown User",
                  headline: userData.headline || "",
                  photoURL: userData.photoURL || null
                };
              }
            } catch (error) {
              console.error("Error fetching user data for post:", error);
            }
            
            return post;
          })
        );
        
        setPosts(postsWithAuthor);
      } catch (error) {
        console.error("Error in posts listener:", error);
        toast({
          title: "Error",
          description: "Could not load posts. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Posts subscription error:", error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Could not subscribe to posts feed.",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const fetchMorePosts = async () => {
    if (!lastVisible || loadingMore || noMorePosts) return;

    try {
      setLoadingMore(true);
      
      const postsQuery = query(
        collection(firestore, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(postsPerPage)
      );
      
      const postsSnapshot = await getDocs(postsQuery);
      
      if (postsSnapshot.empty) {
        setNoMorePosts(true);
        return;
      }
      
      // Set the last document for pagination
      const lastVisibleDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      
      // Get user data for each post
      const morePosts = await Promise.all(
        postsSnapshot.docs.map(async (doc) => {
          const postData = doc.data() as Omit<Post, 'id'>;
          const post: Post = { 
            id: doc.id,
            userId: postData.userId,
            content: postData.content,
            imageUrl: postData.imageUrl,
            likes: postData.likes,
            comments: postData.comments,
            shares: postData.shares,
            createdAt: postData.createdAt,
          };
          
          // Get author data
          try {
            const userDoc = await getDocs(
              query(collection(firestore, "users"), where("userId", "==", post.userId))
            );
            
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              post.author = {
                displayName: userData.displayName || "Unknown User",
                headline: userData.headline || "",
                photoURL: userData.photoURL || null
              };
            }
          } catch (error) {
            console.error("Error fetching user data for post:", error);
          }
          
          return post;
        })
      );
      
      setPosts(prev => [...prev, ...morePosts]);
    } catch (error) {
      console.error("Error loading more posts:", error);
      toast({
        title: "Error",
        description: "Could not load more posts. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  // Check authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleRefreshPosts = () => {
    // The real-time listener will handle updates automatically
    // This is just for manual refresh if needed
    toast({
      title: "Feed refreshed",
      description: "Your feed has been updated with the latest posts"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="glass-card p-6 h-64 animate-pulse"
              ></div>
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
          {/* Create Post */}
          <CreatePost onPostCreated={handleRefreshPosts} />

          {/* Posts */}
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} refreshPosts={handleRefreshPosts} />
              ))}
              
              {!noMorePosts && (
                <div className="flex justify-center pb-6">
                  <Button
                    onClick={fetchMorePosts}
                    disabled={loadingMore}
                    variant="outline"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-6 text-center">
              <h3 className="font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share something with your network!
              </p>
              <Button 
                onClick={() => document.querySelector<HTMLElement>(".glass-card:first-child")?.click()}
                className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white"
              >
                Create a Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
