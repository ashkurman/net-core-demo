using System.Reflection;

using JetBrains.Annotations;


namespace Vme.Backend.Engine
{
	public interface IProgramVersion
	{
		[CanBeNull]
		string GetInformationalVersion();
	}


	public class ProgramVersion : IProgramVersion
	{
		public string GetInformationalVersion()
		{
			try
			{
				string version = typeof(ProgramVersion).GetTypeInfo()
					?.Assembly
					.GetCustomAttribute<AssemblyInformationalVersionAttribute>()
					?.InformationalVersion;

				return version;
			}
			catch
			{
				//todo: get logger and log
				return null;
			}
		}
	}
}
