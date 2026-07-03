# **SIA102 System Integration Guide**

Lord kunin mo na ako

## Overview

---

Hi guys so ganito gagawin natin. So yung “story” nalang natin is **Nueva Vizcaya Provincial Admin System** tas based in NV yung mga system natin, kaya sila connected sa isang admin system.

API-based integration tayo, so yung system ko is mag eexpose sya ng dalawang API, “**api/external/transactions**” tas “**api/external/summary**”, sa server nyo (most likely sa [index.js/server.js](http://index.js/server.js) nyo) eh kailangan may same kayo na API na ganyan ang path para alam ng system ko na yun yung kukuhanan ng data, pero ieexplain ko pa yun later. Kailangan nyo ideploy sa Render as Web Service ung server nyo para mareceive ko online. Hindi nyo na kailangan ideploy yung frontend nyo (for now at least). Bahala na kayo sa name ng idedeploy nyo. Pasend nalang sa GC yung link ng server nyo na nakadeploy sa Render kasi yun ung ilalagay ko sa system ko para maconnect sainyo.

## Schema Adjustments

---

So ayun nga, ung data na isesend nyo saken eh dalawang groups, **summary reports** tas **transaction records**. Ganito isipin nyo guys, since admin system ako, kelangan parang “overview” or “bird’s eye view” lang kailangan ko makita sa mga system nyo. So hindi ko kailangan makita lahat ng data nyo, pero kailangan ko makita ung mga highlights para alam agad at a glance yung performance ng system nyo.

Example ng summary reports is: 

* *total tourists,*   
* *total bookings,*   
* *total customers,*   
* *total revenue,*  
* *top products (tas ilista kung anong specific products)*. 

So since may mga admin dashboard rin naman mga system nyo dba? Kung ano yung mga data na pinapakita nyo dun, parang yun na rin pagbasehan nyo. Wag lang kung super specific talaga. Hindi ko kailangan makita lahat ng rooms sa hotel kung hindi naman binobook or rinereserve.

Example ng transaction records is:

* *reservations,*  
* *orders,*  
* *trips,*  
* *bookings,*  
* *payments*

Sa transaction records is basically any “event” or “interaction” na nangyayari between yung users nyo and the system, so pag may bibili, mag aavail, ganern. Kapag mga “add/update/delete item” eh hindi naman yun interaction between user and system kasi mga administrative actions sya, so wag nyo na isali. Kasi bat naman kailangan alamin ng admin (me) kung nag add or nag update kayo ng item nyo, di naman yun relevant sakin diba? Pero ung data ng mga payments, syempre kailangan ko makita yun para makita ko kung nagproprofit ba yung system, parang ganun.

So por ejemplo kung gagawan natin ng sample JSON format yung sa tourism management system, parang ganito siguro magiging itsura ng isesend nya sakin (hindi ito yung code na isesend nyo, ito ung **format** ng data na isesend nyo):

\[  
  /\**Summary Report*\*/  
  {  
    "totalDestinations": 25,  
    "totalBookings": 120,  
    "totalTourists": 98,  
    "bookingsByStatus": {  
      "confirmed": 85,  
      "pending": 20,  
      "cancelled": 15  
    },  
    "topDestinations": \[  
      { "name": "Dupax del Norte", "totalBookings": 32 },  
      { "name": "Bambang", "totalBookings": 28 },  
      { "name": "Bayombong", "totalBookings": 25 }  
    \]  
  },  
  /\**Transaction/Event Records*\*/  
  {  
    "\_id": "64abc001",  
    "type": "tour booking",  
    "touristName": "Juan dela Cruz",  
    "destination": "Dupax del Norte",  
    "packageName": "Nature Trail Package",  
    "packageDuration": "3 days",  
    "pax": 4,  
    "amount": 1500,  
    "status": "confirmed",  
    "createdAt": "2026-07-01T10:42:00Z"  
  },  
  {  
    "\_id": "64abc002",  
    "type": "guide fee",  
    "touristName": "Pedro Reyes",  
    "guideName": "Carlos Bautista",  
    "guideHours": 6,  
    "destination": "Bayombong",  
    "amount": 500,  
    "status": "paid",  
    "createdAt": "2026-07-02T09:30:00Z"  
  },  
  {  
    "\_id": "64abc003",  
    "type": "cancellation refund",  
    "touristName": "Ana Gonzales",  
    "originalBookingId": "64abc001",  
    "refundReason": "Weather conditions",  
    "refundPercentage": 80,  
    "amount": 1200,  
    "status": "refunded",  
    "createdAt": "2026-07-02T14:00:00Z"  
  }  
\]

*\*\*\*Kristine hindi ko sinasabing gagayahin mo yan na exact, sample lang sya.*

Tantsain nyo nalang kung ano yung mga need talagang isend na field. D naman need lahat ng fields na isend.

Guys hindi kayo gagawa ng completely new na fields para dito. Kailangan nakabase ito sa already existing na data sa database nyo, kailangan nyo lang sya icollect, may mga command yan sa code. Nung una akala ko kailangan nyo gumawa ng bagong collections na nilalaman yung mga yan, pero apparently eh hindi naman daw necessary (pero kung trip nyo edi pwede nyo parin gawin lol). Eto sample na code ng mga API na kailangan nyo gawin:

import express from "express";  
import dotenv from "dotenv";  
import cors from "cors";  
import mongoose from "mongoose";

dotenv.config();

const app \= express();  
app.use(cors());  
app.use(express.json());

// *Assuming they already have these models*  
const Order \= mongoose.model("Order", new mongoose.Schema({  
  customerName: String,  
  items: Array,  
  orderTotal: Number,  
  status: String,  
  type: { type: String, default: "order" },  
  createdAt: { type: Date, default: Date.now },  
}));

const Refund \= mongoose.model("Refund", new mongoose.Schema({  
  customerName: String,  
  reason: String,  
  refundAmount: Number,  
  status: String,  
  type: { type: String, default: "refund" },  
  createdAt: { type: Date, default: Date.now },  
}));

// *\-----------------------------------------------*  
// *SUMMARY ROUTE*  
// *\-----------------------------------------------*  
app.get("/api/external/summary", async (*req*, *res*) \=\> {  
  // *API key check*  
  if (req.headers\["x-api-key"\] \!== process.env.INTERNAL\_API\_KEY) {  
    return res.status(401).json({ success: false, message: "Unauthorized" });  
  }

  const totalOrders \= await Order.countDocuments();  
  const totalRefunds \= await Refund.countDocuments();

  const revenueResult \= await Order.aggregate(\[  
    { $match: { status: "completed" } },  
    { $group: { \_id: null, total: { $sum: "$orderTotal" } } }  
  \]);

  const topItems \= await Order.aggregate(\[  
    { $unwind: "$items" },  
    { $group: { \_id: "$items.name", totalSold: { $sum: "$items.quantity" } } },  
    { $sort: { totalSold: \-1 } },  
    { $limit: 3 }  
  \]);

  res.json({  
    success: true,  
    data: {  
      totalOrders,  
      totalRefunds,  
      totalRevenue: revenueResult\[0\]?.total || 0,  
      ordersByStatus: {  
        completed: await Order.countDocuments({ status: "completed" }),  
        pending: await Order.countDocuments({ status: "pending" }),  
        cancelled: await Order.countDocuments({ status: "cancelled" }),  
      },  
      topSellingItems: topItems.map(*i* \=\> ({ name: i.\_id, totalSold: i.totalSold })),  
    }  
  });  
});

// *\-----------------------------------------------*  
// *TRANSACTIONS ROUTE*  
// *\-----------------------------------------------*  
app.get("/api/external/transactions", async (*req*, *res*) \=\> {  
  // *API key check*  
  if (req.headers\["x-api-key"\] \!== process.env.INTERNAL\_API\_KEY) {  
    return res.status(401).json({ success: false, message: "Unauthorized" });  
  }

  // *Fetch orders and refunds separately*  
  const orders \= await Order.find()  
    .select("customerName orderTotal status type createdAt")  
    .sort({ createdAt: \-1 })  
    .limit(50)  
    .lean();

  const refunds \= await Refund.find()  
    .select("customerName refundAmount status type createdAt")  
    .sort({ createdAt: \-1 })  
    .limit(50)  
    .lean();

  // *Combine and map to common fields*  
  const combined \= \[  
    ...orders.map(*o* \=\> ({  
      ...o,  
      amount: o.orderTotal,  // *map to common "amount" field*  
      type: "order",         // *already in schema but explicit here*  
    })),  
    ...refunds.map(*r* \=\> ({  
      ...r,  
      amount: r.refundAmount, // *map to common "amount" field*  
      type: "refund",         // *already in schema but explicit here*  
    })),  
  \].sort((*a*, *b*) \=\> new Date(b.createdAt).getTime() \- new Date(a.createdAt).getTime());

  res.json({ success: true, data: combined });  
});

*\*\*\*Guys hindi ko sinasabing gagayahin nyo yan na exact, sample lang sya. Ginenerate ko lang yan sa AI lol*

So kita nyo naman eh kailangan nyo lang iimport ung mga models nyo tas gamit lang kayo ng mga method like .countDocuments(), .aggregate(), .select() tas iseselect nyo kung anong specific fields need nyo. D na need gumawa ng collection or model na bago (pero pwede parin naman kung gusto nyo). **REMINDER** na kailangan same ung api path nyo na **/api/external/summary** tas **/api/external/transactions** para maread ng system ko\!\!\!\!

Sa summary nyo eh walang specific na fields na required, basta kung ano sa tingin nyo appropriate. Pero sa transaction records eh para consistent sana, lahat sana ng schema ng mga transactions eh merong \_id, status, timestamp, tas type. 

Yung \_id eh given naman na yan so kebs lang, tas chineck ko yung mga database nyo sa MongoDB Atlas and may timestamp naman kayong lahat. Pero yung iba eh walang status yung mga transaction schema nyo, like ung sayo [MARK DAVES BALTAZAR](mailto:hed-mdbaltazar@smu.edu.ph).Kahit completed/failed lng na status or ikaw bahala kung ano laman. Tas yung sa type eh specifically para sa mga system ito na more than one yung type of transaction nila. Yung kay [MARK DAVES BALTAZAR](mailto:hed-mdbaltazar@smu.edu.ph) eh since reservation lang ung transaction ng system nya, d nya na kailangan maglagay ng type kasi isa lang naman. Pero sayo [Ma. Danilou Paculan](mailto:hed-mdpaculan@smu.edu.ph) since meron kang **bills** tas **payments** na collection, lagyan mo both ng type like “type=bills” sa schema/model para madali sya ifilter at iseparate sa dashboard. Yung mga hindi ko namention na name, pacheck nalang rin sainyo kung ano mga kailangan idagdag.

Meron ring mga system na ung mga transaction records nila eh may mga fields na nagrereference ng ibang collections nila. FYI guys hindi ko yan mareread, kailangan nyo sya ipopulate para masend nyo sakin ung data na un (isearch nyo nalang kung pano). Pero eh kung feel nyo d naman kailangan ilagay yung field na un iexclude nyo nalang sa selection.

Tas ung internal api key rin pala, basically parang authentication lang yan na parang password. Sa .env file nyo (kung wala kayong .env file, gawa kayo tas ilagay nyo sa server folder) tas ilagay nyo: INTERNAL\_API\_KEY=apikey1234. Ichecheck lang ng code kung tugma ba ung API key sa .env nyo dun sa API key ng server ko, so kung match sya edi authorized ka, pero kung hindi sya match edi hindi nya pwede iaccess.  
