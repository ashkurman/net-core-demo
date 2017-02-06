using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

using IF.Lastfm.Core.Api;
using IF.Lastfm.Core.Api.Helpers;
using IF.Lastfm.Core.Objects;

using JetBrains.Annotations;

using Newtonsoft.Json;

using Vme.Backend.Hubs; //todo: get rid of that here
using Vme.Backend.Settings;


namespace Vme.Backend.Engine
{
	public interface ILastFmDataProvider {
		[NotNull, ItemNotNull]
		Task<string[]> GetSimilarArtist( [NotNull] string baselineArtist, uint limit );
		[NotNull]
		Task<ArtistInfoDto> GetArtistInfo( string artistName );
	}


	public class LastFmDataProvider : ILastFmDataProvider
	{
		[NotNull] private readonly LastfmClient _lfmClient;

		public async Task<string[]> GetSimilarArtist( string baselineArtist, uint limit )
		{
			Debug.Assert( !string.IsNullOrEmpty( baselineArtist ), "!string.IsNullOrEmpty( baselineArtist )" );

			if ( limit == 0 ) return new string[0];

			try
			{
				PageResponse<LastArtist> response = await _lfmClient.Artist
					.GetSimilarAsync( baselineArtist, limit: (int) limit );

				if ( !response.Success )
					throw new Exception( response.Status.ToString() ); //todo: dont throw - instrad write method for lfm error handling

				var artists = (
						from artist in response
						where artist != null
						select artist.Name
					)
					.ToArray();

				Debug.Assert( artists != null, "artists != null" );
				return artists;
			}
			catch ( Exception e )
			{
				Console.WriteLine( "ERROR: " + e.Message ); //todo: use aspnetcore logging
				return new string[0];
			}

		}

		public async Task<ArtistInfoDto> GetArtistInfo( string artistName )
		{
			Debug.Assert( artistName != null, "artistName != null" );

			try
			{
				LastResponse<LastArtist> response = await _lfmClient.Artist.GetInfoAsync( artistName );
				Debug.Assert( response != null, "response != null" );

				if ( !response.Success )
					throw new Exception( "LastFm request not successful: " + response.Status ); //todo: dont throw - instrad write method for lfm error handling
				if ( response.Content == null ) throw new Exception("response.Content is null");
				if ( response.Content.Stats == null )throw new Exception("response.Content.Stats is null");

				Console.WriteLine( JsonConvert.SerializeObject( response.Content ));

				var artistInfo = new ArtistInfoDto // extract this to 'extractArtistTags' and unit test it
				{
					Title     = response.Content.Name,
					Listeners = (uint) response.Content.Stats.Listeners,
					Playbacks = (uint) (response.Content.PlayCount ?? 1),
					Tags = response.Content.Tags?
						.Where( tag => tag?.Name != null )
						.Select( tag => tag.Name )
						.ToArray()
						?? new string[0]
				};

				return artistInfo;
			}
			catch ( Exception e )
			{
				Console.WriteLine( "ERROR: " + e.Message ); //todo: use aspnetcore logging
				return null;
			}

		}


		public LastFmDataProvider( [NotNull] LastFmSettings settings )
		{
			_lfmClient = new LastfmClient( settings.ApiKey, null );
			Debug.Assert( _lfmClient.Artist != null, "lfmClient.Artist != null" );
		}
	}
}
