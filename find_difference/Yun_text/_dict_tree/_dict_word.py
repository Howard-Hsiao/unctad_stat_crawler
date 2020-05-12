from copy import deepcopy

class DICT_WORD:
    def __init__(self, word:str, tf:int = 1, tIndex:int = -1, df:int = 0):
        self.word = word
        self.tf = tf     # term frequency
        self.tIndex = -1
        self.df = df     # document frequency, it can only be updated with dith member funcion
                         # "incre_df"

    #property starts
    @property
    def word(self):
        return self._word

    @word.setter
    def word(self, word):
        if(hasattr(self, "_word")):
            raise AttributeError("[!] Can't reset the word value of DICT_WORD")
        if(isinstance(word, str)):
            self._word = word
        else:
            raise TypeError("[!] the word should be of str type. ")

    @property
    def tf(self):
        return self._tf

    @tf.setter
    def tf(self, tf):
        if(hasattr(self, "_tf")):
            raise AttributeError("[!] Can't reset the tf value of DICT_WORD")

        if(isinstance(tf, int)):
            if(tf >= 0):
                self._tf = tf
            else:
                raise ValueError("[!] The value of tf should not be less than 0. ")
        else:
            raise TypeError("[!] The tf of a word should be int type")

    @property
    def df(self):
        return self._df

    @df.setter
    def df(self, df):
        if(hasattr(self, "_df")):
            raise AttributeError("[!] Can't reset the df value of DICT_WORD")

        if(isinstance(df, int)):
            if(df >= 0):
                self._df = df
            else:
                raise ValueError("[!] The value of df should not be less than 0. ")
        else:
            raise TypeError("[!] The df of a word should be int type")

    #operator overloading starts
    def __eq__(self, other):
        '''
        @target: compare based on the value of word
        ---
        @param other: the other word to compare, its type can be
            > str
            > DICT_WORD
        '''
        if(isinstance(other, DICT_WORD)):
            return self.word == other.word
        elif(isinstance(other, str)):
            return self.word == other

    def __ne__(self, other):
        '''
        @target: compare based on the value of word
        ---
        @param other: the other word to compare, its type can be
            > str
            > DICT_WORD
        '''
        return not self.word == other

    def __lt__(self, other):
        '''
        @target: compare based on the value of word
        ---
        @param other: the other word to compare, its type can be
            > str
            > DICT_WORD
        '''
        if(isinstance(other, DICT_WORD)):
            return self.word < other.word
        elif(isinstance(other, str)):
            return self.word < other

    def __le__(self, other):
        '''
        @target: compare based on the value of word
        ---
        @param other: the other word to compare, its type can be
            > str
            > DICT_WORD
        '''
        return (self == other or self < other)

    def __gt__(self, other):
        '''
        @target: compare based on the value of word
        ---
        @param other: the other word to compare, its type can be
            > str
            > DICT_WORD
        '''
        return not self.word <= other

    def __ge__(self, other):
        '''
        @target: compare based on the value of word
        ---
        @param other: the other word to compare, its type can be
            > str
            > DICT_WORD
        '''
        return not self.word < other

    def __add__(self, other):
        '''
        @target: return the sum the DICT_WORD and the other
        ---
        @param other: something to be add to the DICT, its type can be
            > int: tf of the returned DICT_WORD would be the sum of self.tf and other.tf.
            > str: if other is the same to DICT_WORD.word, tf of the returned DICT_WORD
              would be self.tf + 1.
            > DICT_WORD: if the attribute "word" of the both DICT_WORD are equal, tf of the
              returned DICT_WORD would be the sum of self and others'.
        '''
        if(isinstance(other, int)):
            if(other > 0):
                return DICT_WORD(self.word, tf = self.tf + other.tf, tIndex=self.tIndex,
                                 df = self.df + other.df)
            else:
                raise ValueError("[!] the integer added to the DICT_WORD should be greater than 0. ")
        elif(isinstance(other, DICT_WORD) or isinstance(other, str)):
            if(self == other):
                try:
                    return DICT_WORD(self.word, tf = self.tf + other.tf, tIndex=self.tIndex,
                                     df = self.df + other.df)
                except TypeError:
                    return DICT_WORD(self.word, tf = self.tf + 1, tIndex=self.tIndex,
                                     df = self.df + 0) #改這
            else:
                raise ValueError("You cannot add a different word to the DICT_WORD. ")
        else:
            raise TypeError("The type of thing, which you want to add to DICT_WORD is InValid. ")

    def __iadd__(self, other):
        '''
        @target:
            > return the sum the DICT_WORD and the other
            > reset self with the sum of self and other
        ---
        @param other: something to be add to the DICT, its type can be
            > int: tf of the returned DICT_WORD would be the sum of self.tf and other.tf.
            > str: if other is the same to DICT_WORD.word, tf of the returned DICT_WORD
              would be self.tf + 1.
            > DICT_WORD: if the attribute "word" of the both DICT_WORD are equal, tf of the
              returned DICT_WORD would be the sum of self and others'.
        '''
        self = self + other
        return DICT_WORD(self.word, tf = self.tf, tIndex = self.tIndex, df = self.df)

    #function overloading starts
    def __str__(self):
        return ("{}. {}: (tf:{}, df:{})".format(self.tIndex, self.word, self.tf, self.df))

    def incre_df(self):
        self._df += 1

    def _decre_df(self):
        self._df -= 1