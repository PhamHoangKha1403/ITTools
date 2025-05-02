import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { getTools, getFavoriteTools, toggleFavoriteAPI, ToolInfo, removeFavoriteAPI } from "../service/api";

function Home() {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [favoriteToolIds, setFavoriteToolIds] = useState<number[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const userLoggedIn = Boolean(localStorage.getItem("userName"));
  const userRole = localStorage.getItem("role");

  const query = new URLSearchParams(location.search).get("search");

  useEffect(() => {
    getTools(query || "")
      .then((res) => {
        if (res.status === 200 && Array.isArray(res.data?.data)) {
          setTools(res.data.data);
        } else {
          toast.error(res.data?.message || "Failed to load tool list");
          setTools([]);
        }
      })
      .catch(() => {
        toast.error("Failed to load tool list");
        setTools([]);
      });

    if (userLoggedIn) {
      getFavoriteTools()
        .then((res) => {
          if (res.status === 200 && Array.isArray(res.data?.data)) {
            setFavoriteToolIds(res.data.data);
          } else {
             setFavoriteToolIds([]);
          }
        })
        .catch(() => {
            setFavoriteToolIds([]);
        });
    } else {
        setFavoriteToolIds([]);
    }
  }, [query, userLoggedIn]);

  const toggleFavorite = async (toolId: number) => {
    if (!userLoggedIn) {
      toast.warning("Please log in to add tools to favorites");
      return;
    }

    const isCurrentlyFavorite = favoriteToolIds.includes(toolId);
    const originalFavorites = [...favoriteToolIds];

    try {
      if (isCurrentlyFavorite) {
        setFavoriteToolIds((prev) => prev.filter((id) => id !== toolId));
        await removeFavoriteAPI(toolId);
      } else {
        setFavoriteToolIds((prev) => [...prev, toolId]);
        await toggleFavoriteAPI(toolId);
      }
    } catch(err: any) {
      toast.error(err.response?.data?.message || "Failed to update favorites");
      setFavoriteToolIds(originalFavorites);
    }
  };

  const visibleTools = tools.filter(tool => tool.isEnabled !== false);
  const favoriteVisibleTools = visibleTools.filter(tool => favoriteToolIds.includes(tool.id));

  return (
    <div className="flex justify-center px-4 text-white">
      <div className="w-full max-w-screen-xl flex flex-col gap-10 py-6">

        {userLoggedIn && favoriteVisibleTools.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Favorites 💚</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteVisibleTools.map((tool) => (
                  <ToolCard
                    key={`fav-${tool.id}`}
                    tool={tool}
                    isFavorite={true}
                    onToggle={toggleFavorite}
                    userRole={userRole}
                  />
                ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-white mb-4">All Tools 🧰</h2>
          {visibleTools.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {visibleTools.map((tool) => (
                 <ToolCard
                   key={tool.id}
                   tool={tool}
                   isFavorite={favoriteToolIds.includes(tool.id)}
                   onToggle={toggleFavorite}
                   userRole={userRole}
                 />
               ))}
             </div>
          ) : (
             <p className="text-gray-400">No tools found matching your criteria.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  onToggle,
  isFavorite,
  userRole
}: {
  tool: ToolInfo;
  onToggle: (id: number) => void;
  isFavorite: boolean;
  userRole: string | null;
}) {

  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (tool.isPremium && userRole !== '1') {
      e.preventDefault();
      toast.info("Upgrade to Premium to access this tool.");
    }
  };

  return (
    <Link
      to={`/tools/${tool.id}`}
      onClick={handleCardClick}
      className="block w-full min-h-[160px] bg-neutral-700 rounded-lg p-4 shadow hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-grow mr-2">
          <h3 className="text-lg font-bold text-white">{tool.name}</h3>
           {tool.isPremium && (
             <span className="inline-block bg-yellow-500 text-neutral-900 text-xs font-semibold px-2 py-0.5 rounded mt-1">
               ★ PREMIUM
             </span>
           )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggle(tool.id);
          }}
          className="material-icons text-xl p-1 rounded-full hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          style={{
            color: isFavorite ? "#22c55e" : "#a0a0a0",
            cursor: "pointer",
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "favorite" : "favorite_border"}
        </button>
      </div>
      <p className="text-sm text-gray-400 line-clamp-3">{tool.description}</p>
    </Link>
  );
}

export default Home;