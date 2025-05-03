import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import OutputDisplay from "../component/OutputDisplay";
import { toast } from "react-toastify";
import { WidgetProps } from "@rjsf/utils";
import { Switch, FormControlLabel } from "@mui/material";
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Box,
  createTheme,
} from "@mui/material";
import { getToolMetadata, submitTool } from "../service/api";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#212121",
      paper: "#2c2c2c",
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
  const { toolId } = useParams();
  const [metadata, setMetadata] = useState<any>(null);
  const [result, setResult] = useState<any>(null);


  useEffect(() => {
    console.log("toolId:", toolId);
    if (!toolId) return;
    setResult(null);
    setMetadata(null);

    console.log("Fetching metadata for toolId:", toolId);
    getToolMetadata(parseInt(toolId))
      .then((res) => {
        if (res.status === 200) {
          const toolData = res.data.data; 
          console.log("data received:", toolData);

        
          if (toolData.isEnabled === false) { 
            toast.error(`Tool "${toolData.name}" is currently disabled.`);
           
            setMetadata(toolData);
           
          } else {
            
            setMetadata(toolData);
          
          }
        } else {
       
          const message = res.data?.message || "Tool not found or failed to load";
          toast.error(message);
          setMetadata(null); 
        }
      })
      .catch((err) => {
        console.error("Failed to load metadata:", err);
        const message = err?.response?.data?.message || "Failed to load metadata due to a network or server error.";
        toast.error(message);
        setMetadata(null); 
      });
  }, [toolId]);

  const handleSubmit = async ({ formData }: any) => {

    if (!toolId || !metadata || !metadata.isEnabled) {
       toast.warn("Cannot submit data for a disabled tool.");
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

 
  if (!metadata) {
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
        <Typography variant="h4" color="primary" gutterBottom>
          {metadata.name}
        </Typography>
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
        
          {metadata.inputSchema && (
             <Form
               schema={JSON.parse(metadata.inputSchema).schema || {}}
               uiSchema={JSON.parse(metadata.inputSchema).uiSchema || {}}
               onSubmit={handleSubmit}
               validator={validator}
               widgets={{ toggle: ToggleWidget }}
              
             />
          )}
          {!metadata.inputSchema && (
              <Typography color="error">Input schema is missing for this tool.</Typography>
          )}
        </Box>

        {result && (
          <Box sx={{ bgcolor: "#263238", p: 3, borderRadius: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              💡 Result
            </Typography>
          
            {metadata.outputSchema && (
                 <OutputDisplay
                   output={result}
                   outputSchema={JSON.parse(metadata.outputSchema)}
                 />
            )}
             {!metadata.outputSchema && (
                 <Typography color="text.secondary">Output schema is missing, displaying raw result:</Typography>
             )}
            
            
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default ToolPage;