namespace ITTools.Application.Exceptions
{
    public class ToolNotImplementedException : Exception
    {
        public ToolNotImplementedException(string message) : base(message)
        {
        }
        public ToolNotImplementedException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
