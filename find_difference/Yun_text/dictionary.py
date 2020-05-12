import os.path
import math #because we want to use math.log(num, base)
from os.path import isdir
from copy import deepcopy

from .termMachine import *
from ._dict_tree._dict_tree import DICT_TREE
from collections import namedtuple

class Dictionary:
    '''@target: build a dictionary from a document collection'''
    def __init__(self, collection, filter = None):
        '''
        @param collection: the source of document, whose term would be extracted.
            the collection can be
            > a path of a directory that contain a series of raw text files
            > a path of a raw text file
            > a query string
            > a list containing stuff mentioned above
        '''

        self.documentNum = 0
        self._dictTreeRoot = None
        self._dictionary = DICT_TREE()
        self.source = [collection]
        self.filter = filter

        (self._whichMethod())()

    #property starts
    @property
    def documentNum(self):
        return self._documentNum

    @documentNum.setter
    def documentNum(self, num):
        if(hasattr(self, "_documentNum")):
            raise AttributeValue("Can't change the documentNum of Dictionary")
        self._documentNum = num

    @property
    def source(self):
        return self._source

    @source.setter
    def source(self, source):
        if(hasattr(self, "_source")):
            raise AttributeValue("Can't change the source of Dictionary")
        self._source = source
    #property ends
    @property
    def centroid(self):
        result = dict()
        centroid = self.dict_words
        for i in range(len(centroid)):
            result[centroid[i].word] = (1+math.log(centroid[i].tf, 10)) * \
                math.log((self._documentNum)/(centroid[i].df), 10)
        return result

    def _whichMethod(self, target=None):
        if(not target):
            target = self._source[0]

        if(isinstance(target, list)):
            return self._processList
        elif(isdir(target)):
            return self._processDir
        elif(isinstance(target, str)):
            return self._processFileOrQuery
        else:
            raise TypeError('''
            [!]The Type of source is invalid!
            the source of document should be
                > a path of a directory that contain a series of document
                > a path of a document
                > a query string
                > a list containing stuff mentioned above
            ''')

    @property
    def dict_words(self):
        '''
        @target: return all the words(DICT_WORD) in the dictionary to the user.
        ---
        The return value is a list of words in DICT_WORD type.
        '''
        wordData = self._dictionary.inOrderGet(self._dictTreeRoot)
        return [wordNode for wordNode in wordData]

    @property
    def words(self):
        '''
        @target: return all the words(str) in the dictionary to the user.
        ---
        The return value is a list of words in str type.
        '''
        return [wordNode.word for wordNode in self.dict_words]

    def _processList(self, target=None):
        if(not target):
            target = self._source[0]
        for i in target:
            (self._whichMethod(i))(i)

    def _processDir(self, target=None):
        if(not target):
            target = self._source[0]
        filePath = os.listdir(target)
        for file in filePath:
            term = termMachine(os.path.join(target, file)).term
            self._update(term)

    def _processFileOrQuery(self, target=None):
        if(not target):
            target = self._source[0]
        term = termMachine(target).term
        self._update(term)

    def get_tf_idf(self, src, normalized = False): # !!!add the other tolerant param, do not know is it property
        '''
        The formula of tf_idf is as following
        (1 + log(tf)) * log(idf)
        '''
        srcTf = list()
        if(isinstance(src, Dictionary)):
            srcTf = [(i.word, i.tf) for i in src.dict_words]
        else:
            srcTf = termMachine(src).tf_dict.items()

        srcData = dict()
        
        Word_info = namedtuple("Word_info", ["tIndex", "word", "tf", "df", "idf", "tf_idf"])
        for word, tf in srcTf:
            if(self.filter):
                if(word not in self.filter):
                    continue

            wordData = self._dictionary.getSpecificNodeValue(self._dictTreeRoot, word)
            srcData[word] = Word_info(
                tIndex = wordData.tIndex,
                word = word,
                tf = tf,
                df = wordData.df, 
                idf = math.log((self._documentNum)/(wordData.df), 10),
                tf_idf = (1 + math.log(tf, 10)) * math.log((self._documentNum)/(wordData.df), 10)
            )

        if(normalized):
            total_tf_idf_size = 0.0
            for key, words in srcData.items():
                total_tf_idf_size += pow(words["tf-idf"], 2)
            total_tf_idf_size = pow(total_tf_idf_size, 1/2)
            for key in srcData:
                srcData[key]["tf-idf"] = srcData[key]["tf-idf"]/total_tf_idf_size

        return srcData

    def save_tf_idf(self, Doc, FileName="DocID.txt", sep = ", ", end = "\n"):# not deal with filter
        with open(FileName, 'w') as f:
            print("Please waiting for saving tf-idf...", flush=True)
            DocumentData = self.get_tf_idf(Doc)
            f.write("{}{}".format(len(DocumentData), end))
            f.write("{}{}{}{}".format("t_index", sep, "tf-idf", end))
            termList = list(DocumentData.keys())
            termList.sort()
            for term in termList:
                f.write("{}{}{}{}".format(DocumentData[term]["tIndex"], sep, DocumentData[term]["tf-idf"], end))
            print("Saving Complete")

    def cosine(self, word1, word2): # !!!add the other tolerant param, do not know is it property
        '''
        @target: calculate the cosine similarity of word1 and word2
        ---
        @param: word1, word2:
            > the return value of Dictionary.get_tf_idf()
            > Dictionary.centroid
            > documentName
        [Warning]: This function do not checkt the arguments are of legal type.
        '''
        DocData1 = dict()
        DocData2 = dict()

        if(not isinstance(Doc1, dict) and not isinstance(Doc2, dict)):
            DocData1 = self.get_tf_idf(Doc1)
            DocData2 = self.get_tf_idf(Doc2)
        else:
            DocData1 = Doc1
            DocData2 = Doc2

        # Step 1: Calculate the inner product of tf-idf of the given 2 doc
        innerProduct = 0.0
        for word in DocData1:
            if(word in DocData2):
                innerProduct += DocData1[word]["tf-idf"] * DocData2[word]["tf-idf"]

        # Step 2: Divide the innerProduct with the vector length of the vector space of the two doc
        def tf_idf_VectorLength(DocData:dict):
            length = 0.0
            for term, data in DocData.items():
                length += data["tf-idf"] ** 2
            length = length ** (1/2)
            return length

        cosineSim = innerProduct/(tf_idf_VectorLength(DocData1) * tf_idf_VectorLength(DocData2))
        return cosineSim

    def _update(self, newTermList:list, dictMerge = False):
        '''
        @param dictMerge: The flag indicate that if this update used when 2 Dictionary merges.
                          The reason to do so is because that the .df member variable need to be
                          specially processed in this condition.
        '''
        addTermList = list()
        if(self.filter):
            for i in newTermList:
                if i not in self.filter:
                    addTermList.append(i)
        else:
            addTermList = newTermList
        self._dictTreeRoot = self._dictionary.updateWord(self._dictTreeRoot, addTermList,
                                                         dictMerge=dictMerge)
        self._documentNum += 1 #pay attention: documentNum increment here

    def printMember(self):
        print("documentNum", self._documentNum)
        print("source", self._source)
        print("dictionary")
        result = self._dictionary.inOrderGet(self._dictTreeRoot)
        print("dictLen", len(result))
        for i in result:
            print(i)

    def save_dict(self, FileName="dictionary.txt"):
        print("Please wait for saving the dictionary...", flush=True)
        self._dictionary.saveDictTree(self._dictTreeRoot, FileName)
        print("Saving Complete")

    def __iadd__(self, other):

        self._documentNum += (other.documentNum - 1) # !!!為啥減1?
        self._update(other.dict_words, dictMerge=True)
        self._source = self.source + other.source
        return self

    def __add__(self, other):

        newDict = deepcopy(self)
        newDict += other
        return newDict

    def __contains__(self, word):
        if(self._dictionary.search(self._dictTreeRoot, word)):
            return True
        else:
            return False

    def __getitem__(self, word:str):
        if(not isinstance(word, str)):
            raise TypeError("[!] The index of Dictionary should be of str type. ")
        return self._dictionary.getSpecificNodeValue(self._dictTreeRoot, word)

    def addNewSource(self, newCollection):
        (self._whichMethod(target=newCollection))(newCollection)
        if(isinstance(newCollection, list)):
            self._source = self.source + newCollection
        else:
            self._source.append(newCollection)

    def __deepcopy__(self, memo):
        cls = self.__class__
        result = cls.__new__(cls)
        memo[id(self)] = result
        for k, v in self.__dict__.items():
            setattr(result, k, deepcopy(v, memo))
        return result
