﻿namespace ITTools.Application.Exceptions
{
    [Serializable]
    public class BadRequestException : Exception
    {
        public BadRequestException(string message) : base(message) { }
    }
}
