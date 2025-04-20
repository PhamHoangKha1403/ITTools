import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { getTools, toggleFavoriteAPI, ToolInfo } from "../service/api";

function Home() {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const location = useLocation();
  const userLoggedIn = Boolean(localStorage.getItem("userName"));

  const query = new URLSearchParams(location.search).get("search");

  useEffect(() => {
    getTools(query || "")
      .then((res) => {
        if (res.status === 200) {
          setTools(res.data);
        } else {
          toast.error(res.message || "Failed to load tool list");
        }
      })
      .catch(() => toast.error("Failed to load tool list"));
  }, [query]);

  const toggleFavorite = async (toolId: number) => {
    if (!userLoggedIn) {
      toast.warning("Please log in to favorite tools");
      return;
    }

    try {
      await toggleFavoriteAPI(toolId);
      setTools((prev) =>
        prev.map((tool) =>
          tool.id === toolId
            ? { ...tool, isFavorite: !tool.isFavorite }
            : tool
        )
      );
    } catch {
      toast.error("Failed to update favorites");
    }
  };

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-screen-xl flex flex-col gap-10">
        {Array.isArray(tools) && tools.some((t) => t.isFavorite) && (
          <section>
            <h2 className="text-xl font-bold text-white mb-2">Favorites 💚</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6">
              {tools
                .filter((tool) => tool.isFavorite)
                .map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onToggle={toggleFavorite}
                  />
                ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-white mb-2">All Tools 🧰</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onToggle={toggleFavorite}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  onToggle
}: {
  tool: ToolInfo;
  onToggle: (id: number) => void;
}) {
  return (
    <Link
      to={`/tools/${tool.id}`}
      className="block w-[340px] min-h-[160px] bg-neutral-700 rounded-lg p-4 shadow hover:shadow-lg transition relative"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold mb-1">{tool.name}</h3>
          {tool.isPremium && (
            <span className="text-yellow-400 text-xs">★ Premium</span>
          )}
        </div>
        <span
          onClick={(e) => {
            e.preventDefault();
            onToggle(tool.id);
          }}
          className="material-icons text-xl"
          style={{
            color: tool.isFavorite ? "#22c55e" : "#888",
            cursor: "pointer",
          }}
        >
          {tool.isFavorite ? "favorite" : "favorite_border"}
        </span>
      </div>
      <p className="text-sm text-gray-400 mt-2">{tool.description}</p>
    </Link>
  );
}

export default Home;
