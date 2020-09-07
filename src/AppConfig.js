import { format } from "date-fns";
export const DATE_FORMAT_v2 = "MMM yyyy, dd";


export const tableCofig = {
    "data": [
        {
            "date": "2020-09-21",
            "event": "Marriage",
            "description": "Destination wedding.",
            "venue": "Delhi",
            "price": "500",
            "discount": "free",
        },
        {
            "date": "2020-10-21",
            "event": "Birthday",
            "description": "Guests are 70 appx.",
            "venue": "Gurgaon",
            "price": "400",
            "discount": "discount",
        },
        {
            "date": "2020-10-21",
            "event": "Party",
            "description": "Related to cure of a cancer patient.",
            "venue": "Gurgaon",
            "price": "400",
            "discount": "free",
        },
        {
            "date": "2020-10-21",
            "event": "Sangeet",
            "description": "15 guests involved",
            "venue": "Noida",
            "price": "400",
            "discount": "discount",
        },
        {
            "date": "2020-10-21",
            "event": "Engagement",
            "description": "Not Available",
            "venue": "Noida",
            "price": "400",
            "discount": "no_discpunt",
        },
        {
            "date": "2020-10-21",
            "event": "Anniversary",
            "description": "25th Anniversary.",
            "venue": "Gr. Noida",
            "price": "400",
            "discount": "no_discount",
        },
        {
            "date": "2020-10-21",
            "event": "Office Party",
            "description": "Want drinks and no non-veg",
            "venue": "Old Delhi",
            "price": "400",
            "discount": "discount",
        }
    ]
}

export const tableHeader = [
    {
        label: "Date",
        name: "date",
        renderCallback: (rowData) => {
            return format(new Date(rowData.date), DATE_FORMAT_v2);

        }
    },
    {
        label: "Event Name",
        name: "event"
    },
    {
        label: "Description",
        name: "description"
    },
    {
        label: "Venue",
        name: "venue"
    },
    {
        label: "Price",
        name: "price"
    },
    {
        label: "Discount",
        name: "discount"
    }

];

export const FILTER_OPTIONS = [
    {
      label: "All",
      value: "all"
    },
    {
      label: "Discount",
      value: "discount"
    },
    {
      label: "Free",
      value: "free"
    },
    {
      label: "No Discount",
      value: "no_discount"
    }
  ];

  export const NewOrderConfig = 
  [
    {
        "label": "Event Name",
        "type": "text",
        "name": "event",
        "defaultValue": "",
        "validations": {
            "required": true,
        }
       
    },
    {
        "label": "Event Date",
        "type": "datepicker",
        "name": "date",
        "defaultValue": "2020-09-21"
       
    },
    {
        "label": "Description",
        "type": "text",
        "name": "description",
        "defaultValue": "",
        "validations": {
            "required": true,
        }
       
    },
    {
        "label": "Venue",
        "type": "text",
        "name": "venue",
        "defaultValue": "",
        "validations": {
            "required": true,
        }
        
    },
    {
        "label": "Select Offer",
        "type": "select",
        "name": "discount",
        "defaultValue": "",
        "options": [
            {
                "label":"Discount",
                "value": "discount"
            },
            {
                "label":"No Discount",
                "value": "no_discount"
            },
            {
                "label":"Free",
                "value": "free"
            },
            
                        
        ],
        "validations": {
            "required": true,
        }
    },
    
    
]