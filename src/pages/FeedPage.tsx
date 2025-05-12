import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { auth, firestore } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, startAfter, getDocs, getDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CreatePost from "@/components/posts/CreatePost";
import PostItem from "@/components/posts/PostItem";
import { cacheService, CacheService } from "@/services/cache";

interface UserData {
  displayName?: string;
  headline?: string;
  photoURL?: string;
}

const POSTS_PER_PAGE = 10;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const FeedPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const fetchPosts = useCallback(async (isInitial = false) => {
    if (!auth.currentUser) return;
    
    try {
      // Check cache first
      const cachedPosts = cacheService.get<any[]>(CacheService.keys.feed(auth.currentUser.uid));
      if (cachedPosts && isInitial) {
        setPosts(cachedPosts);
        setLoading(false);
        return;
      }

      const postsQuery = query(
        collection(firestore, "posts"),
        orderBy("createdAt", "desc"),
        limit(POSTS_PER_PAGE)
      );

      const postsSnapshot = await getDocs(postsQuery);
      
      if (postsSnapshot.empty) {
        setPosts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const lastVisibleDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      setHasMore(postsSnapshot.docs.length === POSTS_PER_PAGE);

      const fetchedPosts = await Promise.all(
        postsSnapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          
          // Try to get user data from cache first
          let userData = cacheService.get<UserData>(CacheService.keys.userProfile(postData.userId));
          
          if (!userData) {
            try {
              const userDoc = await getDoc(doc(firestore, "users", postData.userId));
              if (userDoc.exists()) {
                userData = userDoc.data() as UserData;
                // Cache user data
                cacheService.set(CacheService.keys.userProfile(postData.userId), userData);
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }

          return {
            id: postDoc.id,
            ...postData,
            author: userData ? {
              displayName: userData.displayName || "User",
              headline: userData.headline || "",
              photoURL: userData.photoURL
            } : {
              displayName: "User",
              headline: "",
              photoURL: undefined
            }
          };
        })
      );

      if (isInitial) {
        setPosts(fetchedPosts);
        // Cache posts
        cacheService.set(CacheService.keys.feed(auth.currentUser.uid), fetchedPosts, CACHE_DURATION);
      } else {
        setPosts(prev => [...prev, ...fetchedPosts]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastVisible) return;
    
    setLoadingMore(true);
    
    try {
      const postsQuery = query(
        collection(firestore, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(POSTS_PER_PAGE)
      );

      const postsSnapshot = await getDocs(postsQuery);
      
      if (postsSnapshot.empty) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      const lastVisibleDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      setHasMore(postsSnapshot.docs.length === POSTS_PER_PAGE);

      const fetchedPosts = await Promise.all(
        postsSnapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          
          // Try to get user data from cache first
          let userData = cacheService.get<UserData>(CacheService.keys.userProfile(postData.userId));
          
          if (!userData) {
            try {
              const userDoc = await getDoc(doc(firestore, "users", postData.userId));
              if (userDoc.exists()) {
                userData = userDoc.data() as UserData;
                // Cache user data
                cacheService.set(CacheService.keys.userProfile(postData.userId), userData);
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }

          return {
            id: postDoc.id,
            ...postData,
            author: userData ? {
              displayName: userData.displayName || "User",
              headline: userData.headline || "",
              photoURL: userData.photoURL
            } : {
              displayName: "User",
              headline: "",
              photoURL: undefined
            }
          };
        })
      );

      setPosts(prev => [...prev, ...fetchedPosts]);
    } catch (error) {
      console.error("Error loading more posts:", error);
      toast({
        title: "Error",
        description: "Failed to load more posts",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, lastVisible, loadingMore, toast]);

  const refreshPosts = useCallback(() => {
    cacheService.delete(CacheService.keys.feed(auth.currentUser?.uid || ""));
    fetchPosts(true);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  return (
    <div className="w-full sm:max-w-2xl sm:mx-auto py-2 sm:py-8 px-0 sm:px-4">
      <CreatePost onPostCreated={refreshPosts} />
      
      <div className="mt-2 sm:mt-8 space-y-3 sm:space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-sigma-purple" />
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostItem key={post.id} post={post} refreshPosts={refreshPosts} />
            ))}
            
            {hasMore && (
              <div className="flex justify-center mt-4 sm:mt-6">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full sm:w-auto"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
