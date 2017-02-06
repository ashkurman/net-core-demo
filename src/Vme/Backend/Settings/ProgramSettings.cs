using JetBrains.Annotations;


namespace Vme.Backend.Settings
{
	public class ProgramSettings
	{
		[NotNull] public LastFmSettings LastFm { get; set; } = new LastFmSettings();
	}

	public class LastFmSettings
	{
		public string ApiKey { get; set; }
		public string ApiSharedSecret { get; set; }
	}
}
