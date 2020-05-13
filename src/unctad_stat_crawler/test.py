from unctad_stat_crawler import UNCTAD_STAT_Crawler

parser = UNCTAD_STAT_Crawler(delay_max = 1)
Economy = ["viet nam"]
Product = ["total all products"]
Partner = ["china"]

output_file_name = "./test2.xlsx"

parser.request_and_save("both", Economy, Product, Partner, output_file_name)