import requests
import xml.etree.ElementTree as ET
import json
from collections import namedtuple
from urllib.parse import quote, unquote

# Global PARAM ---------------------------------------------------------
Item_info = namedtuple("Item_info", ["name", "code"])

## itemCode info path
ITEM_CODE_PATH_TEMPLATE = "../config/{}Code.json"
def default_itemCode_path(itemName):
    if(itemName.lower() not in SUPPORT_ITEM):
        raise ValueError("[!] This item is not supported. ")
    return ITEM_CODE_PATH_TEMPLATE.format(itemName.lower())

## Global Variable
SUPPORT_ITEM = ["economy", "product", "partner"]

## The following path must be this form
GET_ITEM_TEMPLATE = "../config/get{}.json"
def default_get_item_path(itemName):
    if(itemName.lower() not in SUPPORT_ITEM):
        raise ValueError("[!] This item is not supported. ")
    return GET_ITEM_TEMPLATE.format(itemName.capitalize())
# ----------------------------------------------------------------------

class ItemCode_Getter:
    # This is the tool, which is used to obtain the code of economy, partner or product
    def __init__(self, whatData:str, getItem_info_path = None):
        self.itemCode = dict()
        self.whatData = whatData
        self.default_getItem_info = getItem_info_path

        if(not self.default_getItem_info):
            try:
                self._read_json(whatData)
            except FileNotFoundError:
                self.update()
                self.save()
        elif(not isfile(getItem_info_path)):
            self.default_getItem_info = None
            try:
                self._read_json(whatData)
            except FileNotFoundError:
                self.update()
                self.save()
        elif(isfile(getItem_info_path)):
            self.itemCode = json.load(open(self.default_getItem_info, "r", encoding="utf-8").read())
        
    def _read_json(self, whatData):
        self.itemCode = json.load(open(default_itemCode_path(whatData), "r", encoding="utf-8"))
        for key in self.itemCode.keys():
            self.itemCode[key] = Item_info(name=self.itemCode[key][0], code=self.itemCode[key][1])
            
    def save(self, output_path = None):
        if(not output_path):
            output_path = default_itemCode_path(self.whatData)
            
        with open(output_path, "w") as file:
            file.write(json.dumps(self.itemCode))
    
    def _request_itemCode(self, request_info_path):
        # read the request "getItem" info
        rq_info = str() # request info
        with open(request_info_path, "r", encoding = "utf-8") as file:
            rq_info = file.read()
            rq_info = json.loads(rq_info)

        # extract data from the rq_info
        # deal with get method
        URL = rq_info["url"].split('?')[0] # unfinished
        queryString = dict()
        for data in rq_info["queryString"]:
            queryString[data["name"]] = data["value"]
        
        queryString["rowCount"] = str(1000000)
        # rowCount control how many return values we can get
        # if we set an extreme value, we can get all data
        
        for i, key in enumerate(queryString.keys()):
            if(i == 0):
                URL = URL + '?'
            else:
                URL = URL + '&'
            URL = URL + key + '=' + queryString[key]
        
        # deal with headers
        headers = dict()
        for data in rq_info["headers"]:
            headers[data["name"]] = data["value"]

        # deal with post method
        postData = rq_info["postData"]["params"]
        postDataStr = ""
        if(isinstance(postData, list)):
            for i, post in enumerate(postData):
                if(i != 0):
                    postDataStr = postDataStr + '&'
                postDataStr = postDataStr + post["name"] + '=' + post["value"]
            postData = postDataStr
        
        # request itemCode
        itemGetter = requests.post(url = URL, headers = headers, data = postData)
        return itemGetter.text
            
    def update(self, request_info_path=None, save = False,
               output_path=None):
        if(not request_info_path):
            request_info_path = default_get_item_path(self.whatData)
        if(not output_path):
            output_path = default_itemCode_path(self.whatData)
        
        itemCode_xml = self._request_itemCode(request_info_path)
        root = ET.fromstring(itemCode_xml)
        for child in root:
            data = child.attrib
            self.itemCode[data["Label"].lower().strip()] = \
                    Item_info(name=data["Label"], code=data["Handle"])
        if(save):
            self.save(output_path)
        
    def search(self, item):
        if(isinstance(item, str)):
            return self.itemCode[item.lower()]
        
        # if item is of iterable type such as tuple or list
        itemCode = []
        for i in iter(item):
            itemCode.append(self.itemCode[i.lower()])
        return tuple(itemCode)