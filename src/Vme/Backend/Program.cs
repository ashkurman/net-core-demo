using System.Diagnostics;
using System.IO;

using JetBrains.Annotations;

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;


namespace Vme
{
	public class Program
	{
		[NotNull] public static string SettingsFileName { get; private set; } = "settings.json";
		[NotNull] public static string SettingsFilePath { get; private set; }
		[NotNull] public static string RootDirectory { get; private set; }

		public static void Main(string[] args)
		{
			RootDirectory = Directory.GetCurrentDirectory();
			SettingsFilePath = $"{RootDirectory}{Path.DirectorySeparatorChar}{SettingsFileName}";
			if ( !File.Exists( SettingsFilePath ) )
			{
				File.Create( SettingsFilePath ).Dispose();
			}

			var configuration = new ConfigurationBuilder()
				.AddCommandLine(args)
				.AddJsonFile("hosting.json", optional: true)
				?.Build();
			Debug.Assert( configuration != null, "configuration != null");

			var host = new WebHostBuilder()
				.UseKestrel()
			//	.UseContentRoot(Directory.GetCurrentDirectory())
				.UseConfiguration( configuration )
				.UseStartup<Startup>()
				?.Build();
			Debug.Assert( host != null, "configurationhost != null" );

			host.Run();
		}
	}
}
