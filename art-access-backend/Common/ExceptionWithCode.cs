using System.Net;

namespace Common
{
	public class ExceptionWithCode : Exception
	{
		readonly HttpStatusCode _code;
		readonly Dictionary<String, String>? _additionalInformation;
		readonly string _reason;
		public ExceptionWithCode(String message,
			HttpStatusCode code = HttpStatusCode.BadRequest,
			string reason = "",
			Exception? innerException = null, Dictionary<String, String>? additionalInformation = null)
			: base(message, innerException)
		{
			_code = code;
			_reason = reason;
			_additionalInformation = additionalInformation;
		}

		public HttpStatusCode errCode { get { return _code; } }

		public string Reason { get { return _reason; } }

		public Dictionary<String, String>? additionalInformation { get { return _additionalInformation; } }
	}
}
