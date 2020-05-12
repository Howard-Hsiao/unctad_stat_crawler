from os.path import isfile
from copy import copy

class termMachine:
    '''
    This is a machine, helping you to extract term form variable source.
    The source can be
        > str-type query
        > path of the document file
        > path of directory of documents
        > the list consist of the above things
    '''
    def __init__(self, source):
        '''
        @param source: source can be the path of a document of a query whose type is str
            The source can be
            > str-type query
            > path of the document file
            > path of directory of documents
            > the list consist of the above things
        '''
        self.source = source
        self.term = source

    @property
    def source(self):
        return self._source

    @source.setter
    def source(self, source):
        if(hasattr(self, "_source")):
            raise AttributeError("[!] Can't set attribute")
        self._source = source

    @property
    def term(self):
        return copy(self._term)

    @term.setter
    def term(self, source):
        if(hasattr(self, "_term")):
            raise AttributeError("[!] Can't set term list")
        if(isfile(self.source)):
            f = open(self.source, "r")
            self._term = f.read()
            f.close()
        elif(isinstance(self.source, str)):
            self._term = self.source
        else:
            raise ValueError("[!] the source you given to the termMachine is neither path nor query. ")
        self._processing()

    @property
    def tf_dict(self):
        tf_Dict = dict()
        for word in self._term:
            if word not in tf_Dict:
                tf_Dict[word] = 1
            else:
                tf_Dict[word] += 1
        return tf_Dict

    def _processing(self):
        '''
        [!!!]The method of extracting term is defined in this function
        @target: Extract the term from the document
        ---
        @usage: called as private method everyTime termMachine is created
        '''
        MINIMUM_TERM_LEN = 3

        #lowercasing everything
        self._term = self._term.lower()

        #tokenization
        from nltk.tokenize import sent_tokenize, word_tokenize
        sent = sent_tokenize(self._term)
        word = list()
        for i in sent:
            word = word + word_tokenize(i)

        #stemming using Porter's Algorithm
        from nltk.stem import PorterStemmer
        ps = PorterStemmer()
        self._term = list(map(ps.stem, word))

        #remove stopWords
        from nltk.corpus import stopwords
        stop_words = set(stopwords.words('english'))
        myAddictionStopWord = []#We can add new stopWord here
        stop_words.update(myAddictionStopWord)
        import string
        #the work regarding punctuation is not elegant
        termList = list()

        # the most essential part of textMachine
        # we can set up a number of rule to the term
        for w in self._term:
            if w not in stop_words:

                punctuation = set(string.punctuation).union("–—‘’‚“”„")
                termFilter = [set.intersection(punctuation, set(w)) == set() or \
                              len(w) > MINIMUM_TERM_LEN]

                filterResult = True
                for i in termFilter:
                    filterResult = filterResult and i

                if(filterResult):
                    if(w[0] == r"'" or w[0] == r'"'):
                        w = w[1:]
                    termList.append(w)
        self._term = termList

    def save(self, fileName="termList", method = 'w', sep = '\n'):
        '''
        @target: store the result to a file, whose name is defined in FileName
        ---
        @param fileName : the name of the file, in which you want to store the result in
        @param method   : the method that the result is store, there are two options, and the default is 'w'.
            > 'a': - Append - will create a file if the specified file does not exist
            > 'w': - Write - will create a file if the specified file does not exist
        @param sep      : the word that split the result, default is '\\n'
        ---
        @raise ValueError(method): thrown when the user input the invalid method symbol.
        '''
        if (method not in ['w', 'a']):
            raise ValueError("The method symbol is invalid. ")
        with open(fileName, method) as f:
            if(method == 'a'):
                f.write(sep)
            for i, term in enumerate(self._term):
                f.write(term)
                if(i != len(self._term)):
                    f.write(sep)
