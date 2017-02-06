using System;
using System.Diagnostics;
using System.IO;

using JetBrains.Annotations;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using Vme.Backend.Engine;
using Vme.Backend.Settings;


namespace Vme
{
	public class Startup
	{
		private readonly IHostingEnvironment _hostingEnvironment;
		[NotNull] private readonly IConfigurationRoot _configurationRoot;
		[NotNull] private readonly LastFmDataProvider _engine;

		// This method gets called by the runtime. Use this method to add services to the container.
		// For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=398940
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddOptions();
			services.Configure<ProgramSettings>( settings =>
			{
				Debug.Assert( settings != null, "settings != null" );
				settings.LastFm.ApiKey = "API_KEY";
				settings.LastFm.ApiSharedSecret = "SHARED_SECRET";
			} );
			services.Configure<ProgramSettings>( _configurationRoot.GetSection( "Settings" ) );
			services.AddMvc();
			services.AddSignalR();
			services.AddSingleton<ILastFmDataProvider>( _engine );
			services.AddSingleton<IProgramVersion>( new ProgramVersion() );
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
		{
			loggerFactory.AddConsole(LogLevel.Debug);

			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}

			app.UseStaticFiles();
			app.UseMvc( routes =>
			{
				routes.MapRoute( "default", "{controller=index}/{action=Get}" );
			});

			app.UseWebSockets();
			app.UseSignalR("/api");
		}

		/// <inheritdoc />
		public Startup( IHostingEnvironment hostingEnvironment )
		{
			_hostingEnvironment = hostingEnvironment;

			string basePath = hostingEnvironment.ContentRootPath;
			Console.WriteLine(basePath);
			var configuration = new ConfigurationBuilder()
				.SetBasePath( basePath )
				.AddJsonFile("settings.json")
				?.Build();
			Debug.Assert( configuration != null, "configuration != null" );

			_configurationRoot = configuration;
			var settings = _configurationRoot.GetSection( "Settings" ).Get<ProgramSettings>();
			Debug.Assert( settings != null, "settings != null" );

			_engine = new LastFmDataProvider( settings.LastFm );
		}
	}
}
