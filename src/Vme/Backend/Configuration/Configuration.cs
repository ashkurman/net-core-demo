using System.ComponentModel;

using JetBrains.Annotations;

using YamlDotNet.Serialization;


namespace Vme.Backend.Configuration
{
	public static class YamlConvert
	{
		public static T Deserialize<T>( string yaml ) where T : class
		{
			return new Deserializer().Deserialize<T>( yaml );
		}

		//public static string Serialize()
	}

	public class Configuration
	{
		[Description("test")]
		[UsedImplicitly]
		public ushort   Port            { get; set; } = 5000;
		public string[] ListenUrls      { get; set; } = { "127.0.0.1", "*", "localhost" };
		public string   LastfmApiKey    { get; set; } = "API_KEY";
		public string   LastfmApiSecret { get; set; } = "API_SECRET";
	}
}
