// stores.js — the 58 retailers and their sale-page URLs.
// Keep this in sync with the `STORES` array in public/index.html.
export const STORES = [
  // Department (6)
  { name: "Macy's",                category: 'Department',  url: 'https://www.macys.com/shop/sale' },
  { name: 'JCPenney',              category: 'Department',  url: 'https://www.jcpenney.com/g/sale' },
  { name: 'Belk',                  category: 'Department',  url: 'https://www.belk.com/sale/' },
  { name: 'Nordstrom',             category: 'Department',  url: 'https://www.nordstrom.com/browse/sale' },
  { name: "Kohl's",                category: 'Department',  url: 'https://www.kohls.com/sale.jsp' },
  { name: "Dillard's",             category: 'Department',  url: 'https://www.dillards.com/c/sale-clearance' },

  // Apparel (16)
  { name: 'Gap',                   category: 'Apparel',     url: 'https://www.gap.com/browse/sale.do' },
  { name: 'Old Navy',              category: 'Apparel',     url: 'https://oldnavy.gap.com/browse/sale.do' },
  { name: 'American Eagle',        category: 'Apparel',     url: 'https://www.ae.com/us/en/c/sale/cat6680098' },
  { name: 'Hollister',             category: 'Apparel',     url: 'https://www.hollisterco.com/shop/us/mens-clearance' },
  { name: 'Abercrombie & Fitch',   category: 'Apparel',     url: 'https://www.abercrombie.com/shop/us/mens-sale' },
  { name: 'Aéropostale',           category: 'Apparel',     url: 'https://www.aeropostale.com/sale/' },
  { name: 'Free People',           category: 'Apparel',     url: 'https://www.freepeople.com/sale/' },
  { name: 'H&M',                   category: 'Apparel',     url: 'https://www2.hm.com/en_us/sale.html' },
  { name: 'Uniqlo',                category: 'Apparel',     url: 'https://www.uniqlo.com/us/en/special-offer' },
  { name: 'Express',               category: 'Apparel',     url: 'https://www.express.com/c/sale-3540' },
  { name: 'Buckle',                category: 'Apparel',     url: 'https://www.buckle.com/sale' },
  { name: 'PacSun',                category: 'Apparel',     url: 'https://www.pacsun.com/sale/' },
  { name: 'Urban Outfitters',      category: 'Apparel',     url: 'https://www.urbanoutfitters.com/sale-uo' },
  { name: 'Anthropologie',         category: 'Apparel',     url: 'https://www.anthropologie.com/sale' },
  { name: 'J.Crew',                category: 'Apparel',     url: 'https://www.jcrew.com/c/sale' },
  { name: 'Banana Republic',       category: 'Apparel',     url: 'https://bananarepublic.gap.com/browse/sale.do' },

  // Athletic (8)
  { name: 'Foot Locker',           category: 'Athletic',    url: 'https://www.footlocker.com/category/sale.html' },
  { name: 'Finish Line',           category: 'Athletic',    url: 'https://www.finishline.com/store/shop/sale' },
  { name: 'Champs Sports',         category: 'Athletic',    url: 'https://www.champssports.com/category/sale.html' },
  { name: 'Nike',                  category: 'Athletic',    url: 'https://www.nike.com/w/sale-3yaep' },
  { name: 'Adidas',                category: 'Athletic',    url: 'https://www.adidas.com/us/sale' },
  { name: 'Lululemon',             category: 'Athletic',    url: 'https://shop.lululemon.com/c/we-made-too-much/_/N-1z13ziiZ8t6' },
  { name: 'Under Armour',          category: 'Athletic',    url: 'https://www.underarmour.com/en-us/c/outlet/' },
  { name: "Dick's Sporting Goods", category: 'Athletic',    url: 'https://www.dickssportinggoods.com/c/sale' },

  // Beauty (5)
  { name: 'Sephora',               category: 'Beauty',      url: 'https://www.sephora.com/sale' },
  { name: 'Ulta Beauty',           category: 'Beauty',      url: 'https://www.ulta.com/sale' },
  { name: 'Bath & Body Works',     category: 'Beauty',      url: 'https://www.bathandbodyworks.com/c/sale' },
  { name: 'MAC Cosmetics',         category: 'Beauty',      url: 'https://www.maccosmetics.com/sale' },
  { name: 'The Body Shop',         category: 'Beauty',      url: 'https://us.thebodyshop.com/' },

  // Tech (4)
  { name: 'Apple',                 category: 'Tech',        url: 'https://www.apple.com/shop/refurbished' },
  { name: 'Best Buy',              category: 'Tech',        url: 'https://www.bestbuy.com/site/electronics-deals/pcmcat1530641122892.c' },
  { name: 'GameStop',              category: 'Tech',        url: 'https://www.gamestop.com/deals' },
  { name: 'Microsoft Store',       category: 'Tech',        url: 'https://www.microsoft.com/en-us/store/b/sale' },

  // Jewelry (3)
  { name: 'Pandora',               category: 'Jewelry',     url: 'https://us.pandora.net/en/sale/' },
  { name: 'Kay Jewelers',          category: 'Jewelry',     url: 'https://www.kay.com/en/kaystore/sales' },
  { name: 'Zales',                 category: 'Jewelry',     url: 'https://www.zales.com/clearance' },

  // Accessories (2)
  { name: "Claire's",              category: 'Accessories', url: 'https://www.claires.com/us/sale/' },
  { name: 'Sunglass Hut',          category: 'Accessories', url: 'https://www.sunglasshut.com/us/sale' },

  // Home (4)
  { name: 'Pottery Barn',          category: 'Home',        url: 'https://www.potterybarn.com/shop/sale/' },
  { name: 'Williams Sonoma',       category: 'Home',        url: 'https://www.williams-sonoma.com/shop/sale/' },
  { name: 'Crate & Barrel',        category: 'Home',        url: 'https://www.crateandbarrel.com/sale/' },
  { name: 'Yankee Candle',         category: 'Home',        url: 'https://www.yankeecandle.com/category/sale' },

  // Shoes (5)
  { name: 'DSW',                   category: 'Shoes',       url: 'https://www.dsw.com/en/us/category/sale/N-1z141kw' },
  { name: 'Famous Footwear',       category: 'Shoes',       url: 'https://www.famousfootwear.com/en_us/clearance.html' },
  { name: 'Journeys',              category: 'Shoes',       url: 'https://www.journeys.com/sale' },
  { name: 'Vans',                  category: 'Shoes',       url: 'https://www.vans.com/shop/mens-sale' },
  { name: 'Crocs',                 category: 'Shoes',       url: 'https://www.crocs.com/c/sale' },

  // Specialty (4)
  { name: 'LEGO',                  category: 'Specialty',   url: 'https://www.lego.com/en-us/categories/sales-and-deals' },
  { name: 'Disney Store',          category: 'Specialty',   url: 'https://www.shopdisney.com/sale-and-values' },
  { name: 'Hot Topic',             category: 'Specialty',   url: 'https://www.hottopic.com/sale/' },
  { name: "Spencer's",             category: 'Specialty',   url: 'https://www.spencersonline.com/sale/' },

  // Books & Fun (1)
  { name: 'Barnes & Noble',        category: 'Books & Fun', url: 'https://www.barnesandnoble.com/b/sale-bargain-books/_/N-29Z8q8' },
];
