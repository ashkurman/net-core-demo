using System;
using System.Threading.Tasks;

using JetBrains.Annotations;

using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Newtonsoft.Json;

using Vme.Backend.Engine;
using Vme.Backend.Settings;


namespace Vme.Backend.Hubs
{
	public class ArtistInfoDto
	{
		//public Guid Id { get; set; } use when caching will work
		public string   Title     { get; set; }
		public uint     Listeners { get; set; }
		public uint     Playbacks { get; set; }
		[NotNull]
		public string[] Tags      { get; set; } = new string[0];
	}

	public class SimilarArtistInfo
	{
		public string     BaselineArtistName { get; set; }
		public ArtistInfoDto Artist             { get; set; }
		public decimal    Similarity         { get; set; }
	}


	public class ArtistsSimilarity
	{
		public string BaselineArtistTitle { get; set; }
		public string SimilartAtistTitle  { get; set; }

		/// <summary>
		/// Similarity in percents as fraction of 1 (0..1)
		/// </summary>
		public decimal Similarity { get; set; }
	}


	[UsedImplicitly]
	public class ApiHub : Hub
	{
		[NotNull] private readonly ILogger                   _log;
		[NotNull] private readonly ILastFmDataProvider         _lastfmProvider;
		[NotNull] private readonly IOptions<ProgramSettings> _settings;

		public async Task<string[]> GetSimilarArtists( string baselineArtistTitle, uint? limit = null )
		{
			var emptyResult = new string[0];
			if ( string.IsNullOrEmpty( baselineArtistTitle ) )
				return emptyResult;
			if ( limit == 0 )
				return emptyResult;
			try
			{
				string[] similarArtists = await _lastfmProvider.GetSimilarArtist( baselineArtistTitle, limit ?? 0 );
				_log.LogDebug( 0, "{0} OK -> {1}", nameof(GetSimilarArtists), JsonConvert.SerializeObject( similarArtists ));
				return similarArtists;
			}
			catch ( Exception e )
			{
				_log.LogError( 0, e, "Unexpected error." );
				return emptyResult;
			}
		}

		public async Task<ArtistInfoDto> GetArtistInfo( string artistName )
		{
			if ( string.IsNullOrEmpty( artistName )) return null;

			try
			{
				var artistInfo = await _lastfmProvider.GetArtistInfo( artistName );
				_log.LogDebug( 0, "{0} OK -> {1}", nameof(GetArtistInfo),  JsonConvert.SerializeObject( artistInfo )  );
				return artistInfo;
			}
			catch ( Exception e )
			{
				_log.LogError( 0, e, "Unexpected error." );
				return null;
			}
		}

		public string Ping()
		{
			return "Pong";
		}

		/// <exception cref="ArgumentNullException"><paramref name="lastfmProvider"/> is <see langword="null" /> or <paramref name="logger"/> is <c>null</c>.</exception>
		public ApiHub( ILastFmDataProvider lastfmProvider, ILogger<ApiHub> logger, IOptions<ProgramSettings> settings  )
		{
			if ( lastfmProvider == null ) throw new ArgumentNullException( nameof(lastfmProvider) );
			if ( logger == null ) throw new ArgumentNullException( nameof(logger) );
			if ( settings == null ) throw new ArgumentNullException( nameof(settings) );

			_lastfmProvider = lastfmProvider;
			_log = logger;
			_settings = settings;
		}
	}
}
