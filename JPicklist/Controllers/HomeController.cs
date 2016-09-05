using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace JPicklist.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Simpler()
        {
            ViewBag.Message = "This is a simple JQuery based PickList. It requires handlebars.js also as the templates used here are handlebar templates.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Contact & Support.";

            return View();
        }

        private char[] alphabets
        {
            get
            {
                return (new char[] { 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' });
            }
        }

        private string[] months
        {
            get
            {
                return (new string[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" });
            }
        }

        private int[] daysinmonth
        {
            get
            {
                return (new int[] { 31,28,31,30,31,30,31,31,30,31,30,31 });
            }
        }

        private string[] timeslots
        {
            get
            {
                return (new string[] { "8", "8.30", "9", "9.30", "10", "10.30", "11", "11.30", "12", "12.30", "13", "13.30","14","14.30" });
            }
        }

        [HttpPost]
        public JsonResult AllCitiList(JPickerListViewModel model)
        {
            if (model==null)
            {
                model = new JPickerListViewModel();
            }
            if (string.IsNullOrWhiteSpace(model.Alphabet))
            {
                model.Alphabet = "A";
            }
            model.PagingKeysList = alphabets.Select(x => x.ToString()).ToList();
            model = LoadCities(model);
            return Json(model);
        }

        [HttpPost]
        public JsonResult CalendarPicker(JPickerListViewModel model)
        {
            if (model == null)
            {
                model = new JPickerListViewModel();
            }

            model = LoadTimeSlots(model);
            return Json(model);
        }

        private JPickerListViewModel LoadTimeSlots(JPickerListViewModel model)
        {
            model.ItemsList = new List<JPicklist.Controllers.JPickerListItems>();
            model.ItemsCount = 0;

            //when no month selected show the Months and return
            //also provide a back button to go back to months display
            if ((string.IsNullOrWhiteSpace(model.Alphabet)) || (model.Alphabet.Equals("back", StringComparison.InvariantCultureIgnoreCase)))
            {
                model.PagingKeysList = months.Select(x => x).ToList();
                return model;
            }//Else if we found a calendar month in the Alphabet
            else if(months.Where(x=>x.Equals(model.Alphabet,StringComparison.InvariantCultureIgnoreCase)).Count()>0)
            {
                int numDays= daysinmonth[Array.IndexOf(months,model.Alphabet)];
                model.PagingKeysList = new List<string>();

                for (int tmp = 1; tmp <= numDays; tmp++)
                {
                    model.PagingKeysList.Add(model.Alphabet+"-"+tmp.ToString());
                }
                model.PagingKeysList.Add("back");
            }
            else
            {
                model.PagingKeysList = new List<string>();
                model.PagingKeysList.Add("back");

                var itmlist = timeslots.Select(y => new JPickerListItems() { Key = model.Alphabet + "-" + y, Value = model.Alphabet + "-" + y, DisplayText = y, IsSelected = ((model._SelectedKeys != null) && (model._SelectedKeys.Count > 0) && (model._SelectedKeys.Contains(model.Alphabet+"-"+y))) }).ToList();
                foreach (var item in itmlist)
                {
                    model.ItemsList.Add(item);
                }     
            }

            return model;
        }

        private JPickerListViewModel LoadCities(JPickerListViewModel model)
        {
            model.ItemsList = new List<JPicklist.Controllers.JPickerListItems>();
            model.ItemsCount = 0;
            Dictionary<string, string> cd =  JPicklist.Models.AirportCodes.Instance().ReadAllCodes();
            var fltcd = cd.Where(item=> item.Value.Trim().StartsWith(model.Alphabet,StringComparison.InvariantCultureIgnoreCase));
            foreach (var item in fltcd)
            {
                var itmToAdd = new JPickerListItems() { Key = item.Key, Value = item.Value, DisplayText = item.Value, IsSelected = false };
                if (((model._SelectedKeys != null) && (model._SelectedKeys.Count > 0))&&(model._SelectedKeys.Contains(itmToAdd.Key)))
                {
                    itmToAdd.IsSelected = true;
                }
                model.ItemsList.Add(itmToAdd);
                model.ItemsCount++;
            }
            return model;
        }
    }

    public class JPickerListViewModel
    {
        public List<string> PagingKeysList { get; set; }

        public List<JPickerListItems> ItemsList { get; set; }

        public string Alphabet { get; set; }

        public bool IsFirstLoad { get; set; }

        public int ItemsCount { get; set; }

        public string SelectedKeys { get; set; }

        public List<string> _SelectedKeys {
            get
            {
                if (!string.IsNullOrWhiteSpace(SelectedKeys))
                {
                    //return (SelectedKeys.Split(new char[] { ',' }).Select(x => x.Trim(new char[] { '"', ' ', '\\' })).ToList());
                    return (new System.Web.Script.Serialization.JavaScriptSerializer().Deserialize<List<string>>(SelectedKeys));
                }
                else
                {
                    return (null);
                }
            }
        }
    }        
    
    public class JPickerListItems
        {
            public string Key { get; set; }
            public string Value { get; set; }
            public bool IsSelected { get; set; }
            public string DisplayText { get; set; }
        }
}