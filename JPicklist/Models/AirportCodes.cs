using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace JPicklist.Models
{
    public class AirportCodes
    {
        private static AirportCodes _instance;
        private string _dbPath;

        public AirportCodes(string dbPath)
        {
            // TODO: Complete member initialization
            this._dbPath = dbPath;
        }
        public static AirportCodes Instance()
        {
            if (_instance==null)
            {
                _instance = new AirportCodes(HttpContext.Current.Server.MapPath("~/Content/Db/world_airport_codes.txt"));
            }
            return (_instance);
        }

        public Dictionary<string, string> ReadAllCodes()
        {
            StreamReader reader = File.OpenText(this._dbPath);
            Dictionary<string, string> ctryD = new Dictionary<string, string>();
            string line;
            while ((line = reader.ReadLine()) != null)
            {
                string[] items = line.Split('\t');
                string ccode = items[0];
                string cnm = line.Substring(line.IndexOf('\t')+1);
                ctryD.Add(ccode, cnm);

            }
            return (ctryD);
        }
    }
}