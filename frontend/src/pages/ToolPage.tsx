import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import OutputDisplay from "../component/OutputDisplay";
import { toast } from "react-toastify";
import { WidgetProps } from "@rjsf/utils";
import {
  Switch,
  FormControlLabel,
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Box,
  createTheme,
  IconButton,
} from "@mui/material";

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { getToolMetadata, submitTool, getFavoriteTools, toggleFavoriteAPI, removeFavoriteAPI } from "../service/api";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#212121",
      paper: "#2c2c2c",
    },
    success: { 
      main: '#22c55e',
    },
  },
});

const ToggleWidget = ({ value, onChange, label }: WidgetProps) => (
  <FormControlLabel
    control={
      <Switch
        checked={!!value}
        onChange={(event) => onChange(event.target.checked)}
      />
    }
    label={label}
  />
);

function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>(); 
  const [metadata, setMetadata] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState<boolean>(false);

  const userLoggedIn = Boolean(localStorage.getItem("userName"));

  useEffect(() => {
    if (!toolId) return;

    const currentToolId = parseInt(toolId);
    if (isNaN(currentToolId)) {
      toast.error("Invalid Tool ID.");
      setMetadata(null);
      return;
    }


    setResult(null);
    setMetadata(null);
    setIsFavorite(false);
    setIsLoadingFavorite(false);

    console.log("Fetching metadata for toolId:", currentToolId);
    getToolMetadata(currentToolId)
      .then(async (res) => { 
        if (res.status === 200) {
          const toolData = res.data.data;
          console.log("data received:", toolData);

          setMetadata(toolData);

          if (toolData.isEnabled === false) {
            toast.error(`Tool "${toolData.name}" is currently disabled.`);
            return; 
          }

          
          if (userLoggedIn) {
            try {
              console.log("Fetching favorite status for toolId:", currentToolId);
              const favRes = await getFavoriteTools();
              if (favRes.status === 200 && Array.isArray(favRes.data?.data)) {
                const favoriteToolIds = favRes.data.data;
                setIsFavorite(favoriteToolIds.includes(currentToolId));
                console.log("Favorite status:", favoriteToolIds.includes(currentToolId));
              } else {
                console.warn("Could not fetch favorite tools or invalid format.");
                setIsFavorite(false);
              }
            } catch (favErr) {
              console.error("Failed to load favorite status:", favErr);
              setIsFavorite(false); 
            }
          } else {
             setIsFavorite(false); 
          }

        } else {
          const message = res.data?.message || "Tool not found or failed to load";
          toast.error(message);
          setMetadata(null);
           setIsFavorite(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load metadata:", err);
        const message = err?.response?.data?.message || "Failed to load metadata due to a network or server error.";
        toast.error(message);
        setMetadata(null);
         setIsFavorite(false);
      });
  }, [toolId, userLoggedIn]); 

  const handleToggleFavorite = async () => {
    if (isLoadingFavorite || !toolId || !metadata || !metadata.isEnabled) return; // Prevent action if loading, no toolId, or tool disabled

    if (!userLoggedIn) {
      toast.warning("Please log in to manage favorites.");
      return;
    }

    const currentToolId = parseInt(toolId);
    const originalIsFavorite = isFavorite;
    setIsLoadingFavorite(true); 
    setIsFavorite(!originalIsFavorite); 

    try {
      if (originalIsFavorite) {
        await removeFavoriteAPI(currentToolId);
        toast.success(`"${metadata.name}" removed from favorites.`);
      } else {
        await toggleFavoriteAPI(currentToolId);
        toast.success(`"${metadata.name}" added to favorites.`);
      }
    } catch (err: any) {
      console.error("Failed to update favorite status:", err);
      toast.error(err.response?.data?.message || "Failed to update favorites");
      setIsFavorite(originalIsFavorite); 
    } finally {
      setIsLoadingFavorite(false);
    }
  };


  const handleSubmit = async ({ formData }: any) => {
    if (!toolId || !metadata || !metadata.isEnabled) {
       toast.warn("Cannot submit data for a disabled or non-existent tool.");
       return;
    }
    try {
      const res = await submitTool(parseInt(toolId), formData);
      setResult(res.data);
    } catch (err: any) {
      console.error("Failed to submit tool:", err);
      const message = err?.response?.data?.message || "Failed to process tool";
      toast.error(message);
    }
  };


  if (!metadata && !toolId) {
       return <div className="text-white p-8">Invalid request.</div>;
  }
  if (!metadata && toolId) {
      return <div className="text-white p-8">🔄 Loading tool...</div>;
  }


  if (metadata.isEnabled === false) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Container maxWidth="md" sx={{ pt: 6, pb: 8 }}>
          <Typography variant="h4" color="error" gutterBottom>
            Tool Disabled
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The tool "{metadata.name || 'this tool'}" is currently disabled and cannot be accessed.
          </Typography>
        </Container>
      </ThemeProvider>
    );
  }


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ pt: 6, pb: 8 }}>

         
         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h4" color="primary" gutterBottom sx={{ mb: 0, flexGrow: 1 }}>
               {metadata.name}
            </Typography>
          
            {userLoggedIn && metadata && metadata.isEnabled && (
               <IconButton
                  onClick={handleToggleFavorite}
                  disabled={isLoadingFavorite} 
                  color={isFavorite ? "success" : "default"}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  sx={{
                     color: isFavorite ? darkTheme.palette.success.main : "#a0a0a0", 
                     ml: 1, 
                  }}
               >
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
               </IconButton>
            )}
         </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {metadata.description}
        </Typography>

        <Box
          sx={{
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            mb: 4,
          }}
        >

          {metadata.inputSchema ? (
             <Form
                schema={JSON.parse(metadata.inputSchema).schema || {}}
                uiSchema={JSON.parse(metadata.inputSchema).uiSchema || {}}
                onSubmit={handleSubmit}
                validator={validator}
                widgets={{ toggle: ToggleWidget }}
              
             />
          ) : (
             <Typography color="error">Input schema is missing for this tool.</Typography>
          )}

        </Box>

        {result && (
          <Box sx={{ bgcolor: "#263238", p: 3, borderRadius: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              💡 Result
            </Typography>

            {metadata.outputSchema ? (
                 <OutputDisplay
                    output={result}
                    outputSchema={JSON.parse(metadata.outputSchema)}
                 />
             ) : (
                <>
                 <Typography color="text.secondary">Output schema is missing, displaying raw result:</Typography>
               
                 <pre style={{ color: 'white', background: '#1e1e1e', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                   {JSON.stringify(result, null, 2)}
                 </pre>
                </>
             )}

          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default ToolPage;