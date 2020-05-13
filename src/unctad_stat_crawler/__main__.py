import argparse
import json
from unctad_stat_crawler import UNCTAD_STAT_Crawler

DEFAULT_INPUT = "./demand.json"
DEFAULT_OUTPUT = "./result/result.xlsx"
DEFAULT_DELAY = 1

def buildParser():
    parser = argparse.ArgumentParser()

# positional argument
    parser.add_argument("inputType", help=
        '''
        Determine what method do you want to input your demand. Its value can be
        * "path"
        * "arg"
        ''', type=str)

    parser.add_argument("dataType", type=str,  
        help="What data do you want to get? We support \"import\", \"export\" , and \"both\"")

# optional argument
    parser.add_argument("-i", "--inputFile", type=str, default=DEFAULT_INPUT,  
        help="Where is the file recording your demand?\nThe default path is \"{}\". ".format(DEFAULT_INPUT))

    parser.add_argument("-o", "--output", type=str, default=DEFAULT_OUTPUT,  
        help="Where to store the result?\nThe default path is \"{}\". ".format(DEFAULT_OUTPUT))

    parser.add_argument("-ec", "--economy", type=str, nargs='+', 
        help="What economy do you want to know?")

    parser.add_argument("-pr", "--product",  type=str, nargs='+',
        help="What product do you want to know?")

    parser.add_argument("-pa", "--partner", type=str, nargs='+',
        help="What partner do you want to know?")

    parser.add_argument("-d", "--delay_max", default=DEFAULT_DELAY, type=float, 
        help="To mimic human's action, determine the gap between every request to the target. " +\
                "The default value is 1, and our program will select a number on the interval " +\
                "[0, delay_max]")

    parser.add_argument("-v", "--verbose", default=True, type=bool, 
        help="Increase output verbosity")

    return parser

if(__name__ == "__main__"):
    parser = buildParser()
    args = parser.parse_args()
    crawler = UNCTAD_STAT_Crawler()

    if(not (args.inputType == "path" or args.inputType == "arg")):
        raise ValueError("[!] You shoud give \"inputType\" \"path\" or \"arg\" argument. ")
    else:        
        info = None
        if(args.inputType == "path"):
            with open("demand.json", "r", encoding="utf-8") as file:
                info = file.read()
            crawler.request_and_save(args.dataType, info["Economy"], info["Product"], info["Partner"], 
                    args.output, display_progress_rate=args.verbose)

        elif(args.inputType == "arg"):
            if(not args.economy):
                raise Exception("[!] You should enter your interested economy. ")
            if(not args.product):
                raise Exception("[!] You should enter your interested product. ")
            if(not args.partner):
                raise Exception("[!] You should enter your interested partner. ")
            
            crawler.request_and_save(args.dataType, args.economy, args.product, args.partner, 
                args.output, display_progress_rate=args.verbose)