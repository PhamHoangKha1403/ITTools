import { Typography, Box } from "@mui/material";

const OutputDisplay = ({
  output,
  outputSchema,
}: {
  output: any;
  outputSchema: any;
}) => {
  if (!output || !outputSchema) return null;

  const renderValue = (value: any) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
  };

  const commonBoxStyle = {
    p: 2,
    bgcolor: "#1e1e1e",
    border: "1px solid #444",
    borderRadius: 1,
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    color: "#ffffff",
  };

  if (outputSchema.type === "object") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(output).map(([key, value]) => (
          <Box key={key}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
              {key}
            </Typography>
            <Box sx={commonBoxStyle}>{renderValue(value)}</Box>
          </Box>
        ))}
      </Box>
    );
  }

  return <Box sx={commonBoxStyle}>{renderValue(output)}</Box>;
};

export default OutputDisplay;
