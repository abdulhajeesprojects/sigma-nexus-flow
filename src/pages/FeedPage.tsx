
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs, where, startAfter, 
  QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import CreatePost from "@/components/posts/CreatePost";
import PostItem from "@/components/posts/PostItem";
import { Button } from "@/components/ui/button";

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
  const postsPerPage = 5;

  const fetchPosts = async (lastDoc?: QueryDocumentSnapshot<DocumentData> | null) => {
    if (!auth.currentUser) return;

    try {
      // Create query for fetching posts
      let postsQuery;
      
      if (lastDoc) {
        postsQuery = query(
          collection(firestore, "posts"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(postsPerPage)
        );
        setLoadingMore(true);
      } else {
        postsQuery = query(
          collection(firestore, "posts"),
          orderBy("createdAt", "desc"),
          limit(postsPerPage)
        );
      }
      
      const postsSnapshot = await getDocs(postsQuery);
      
      // Set the last document for pagination
      const lastVisible = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      
      if (postsSnapshot.empty) {
        setNoMorePosts(true);
        setLoadingMore(false);
        return;
      }
      
      setLastVisible(lastVisible);
      
      // Get user data for each post
      const postsWithAuthor = await Promise.all(
        postsSnapshot.docs.map(async (doc) => {
          const postData = { id: doc.id, ...doc.data() } as Post;
          
          // Get author data
          try {
            const userDoc = await getDocs(
              query(collection(firestore, "users"), where("userId", "==", postData.userId))
            );
            
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              postData.author = {
                displayName: userData.displayName || "Unknown User",
                headline: userData.headline || "",
                photoURL: userData.photoURL || null
              };
            }
          } catch (error) {
            console.error("Error fetching user data for post:", error);
          }
          
          return postData;
        })
      );
      
      if (lastDoc) {
        setPosts(prev => [...prev, ...postsWithAuthor]);
      } else {
        setPosts(postsWithAuthor);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      fetchPosts();
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLoadMore = () => {
    if (lastVisible) {
      fetchPosts(lastVisible);
    }
  };

  const handleRefreshPosts = () => {
    setPosts([]);
    setLastVisible(null);
    setNoMorePosts(false);
    fetchPosts();
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
                    onClick={handleLoadMore}
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
