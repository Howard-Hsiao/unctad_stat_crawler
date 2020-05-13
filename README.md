# unctad_stat_crawler

## Target tables
* Merchandise trade matrix – product groups, exports in thousands of United States dollars
* Merchandise trade matrix – product groups, imports in thousands of United States dollars

## Environment
Python3

## Dependencies
Use the following command to download the dependencies if needed.

* openpyxl
```{shell}
pip3 install openpyxl
```

## Prequisition
1. clone the repo by input the following command on
```{shell}
git clone https://github.com/Howard-Hsiao/unctad_stat_crawler.git
```
2. move the whole /src/unctad_stat_crawler to the directory, where the python file importing this package is.

## How to use
There are 2 ways to use this crawler, we will discuss them in the following parts.
* ### import it like a package

Use the following command to import the crawler
```{python}
from unctad_stat_crawler import UNCTAD_STAT_Crawler
```

Sample Usage
```{python}
parser = UNCTAD_STAT_Crawler(delay_max = 1)
Economy = ["viet nam"]
Product = ["total all products"]
Partner = ["china"]
output_file_name = "./test.xlsx"

parser.request_and_save("both", Economy, Product, Partner, output_file_name)
```

Note: For further function details, go to the [API Introduction](./doc/unctad_stat_crawler.md).

* ### use it like an executable
1. open the cmd, and move to the "unctad_stat_crawler/" directory
2. Use the following command
```{shell}
python3 unctad_stat_crawler <proper argument>
```
The argument you should pass to the "unctad_stat_crawler" is as following.
```{r}
usage: unctad_stat_crawler [-h] [-i INPUTFILE] [-o OUTPUT]
                           [-ec ECONOMY [ECONOMY ...]]
                           [-pr PRODUCT [PRODUCT ...]]
                           [-pa PARTNER [PARTNER ...]] [-d DELAY_MAX]
                           [-v VERBOSE]
                           inputType dataType
positional arguments:
  inputType             Determine what method do you want to input your
                        demand. Its value can be * "path" * "arg"
  dataType              What data do you want to get? We support "import",
                        "export" , and "both"
optional arguments:
  -h, --help            show this help message and exit
  -i INPUTFILE, --inputFile INPUTFILE
                        Where is the file recording your demand? The default
                        path is "./demand.json".
  -o OUTPUT, --output OUTPUT
                        Where to store the result? The default path is
                        "./result/result.xlsx".
  -ec ECONOMY [ECONOMY ...], --economy ECONOMY [ECONOMY ...]
                        What economy do you want to know?
  -pr PRODUCT [PRODUCT ...], --product PRODUCT [PRODUCT ...]
                        What product do you want to know?
  -pa PARTNER [PARTNER ...], --partner PARTNER [PARTNER ...]
                        What partner do you want to know?
  -d DELAY_MAX, --delay_max DELAY_MAX
                        To mimic human's action, determine the gap between
                        every request to the target. The default value is 1,
                        and our program will select a number on the interval
                        [0, delay_max]
  -v VERBOSE, --verbose VERBOSE
                        Increase output verbosity
```
