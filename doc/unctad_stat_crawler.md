# unctad_stat_crawler.md
## API Introduction
```{python}
class UNCTAD_STAT_Crawler:
def __init__(self, delay_max = 1, update_code = False):
'''
@param delay_max:
  To mimic human's action, determine the gap between
  every request to the target. The default value is 1,
  and our program will select a number on the interval
  [0, delay_max]
@param update_code:
      Before we start making a request to get the specific tables from
    the target website, it is of inevitable that we obtain the itemCode
    of each item, such as 'economy', 'product', and 'partner',  in advance.  
      There's 2 ways for us to get such the information.
      1. from the local file, /src/config/<item>Code.json
      2. request from the https://unctadstat.unctad.org/
      The parameter 'update_code' is the thing that you can force the
    crawler to update the information and save it to the /src/config.
'''

request_and_save(self, whatData:str, Economy:list, Product:list, Partner:list,
                  output_path:str, Period = None, display_progress_rate=True):
'''
@param whatData: What data do you want to get? We support "import",
                "export" , and "both"
@param Economy: What economy do you want to know?
@param Product: What product do you want to know?
@param Partner: What partner do you want to know?
@param output_path: After crawling the ordered data, where should we store them
@param display_progress_rate:
    If this parameter is set to True, then you can track the progress of
    the crawler when it start crawling.

@param Period: not support yet.

Note: when the number of Economy is more than 1, the crawler will store the
      data into saperate files. Their names whould become
      output_path_<Economy_name>.xlsx.  
'''
```
