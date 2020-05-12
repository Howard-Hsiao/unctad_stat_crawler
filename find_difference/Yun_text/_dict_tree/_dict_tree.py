from ._dict_word import *
from ._avl_tree import *

class DICT_TREE(AVL_Tree):
    def __init__(self):
        self.__initialIndex = -1 # just used to update the index

    def _addWord(self, root, word:DICT_WORD, incre_df = False, dictMerge = False):
        ### !!!!!!!!!!!!!!!!!WRONG
        if(isinstance(word, str)):
            word = DICT_WORD(word)
        if(not isinstance(word, DICT_WORD)):
            raise TypeError("[!] the word you add to the Dict should be type str of DICT_WORD. ")

        if(not root):
            if(word.df == 0):
                word.incre_df() # let the first inserted word's df be 1
            return TreeNode(word)
        elif(not super().search(root, word)):
            if(word.df == 0):
                word.incre_df() # let the first inserted word's df be 1
            return super().insert(root, word)
        else:
            self.__plus(root, word, incre_df, dictMerge = dictMerge)
            return root

    def updateWord(self, root, termList:list, dictMerge:bool = False):
        if(not isinstance(termList, list)):
            raise TypeError("[!] when using DICT_TREE.updateWord, the second argument should be a list. ")

        have_add = set()
        for term in termList:
            if(isinstance(term, str)):
                wordAdded = DICT_WORD(term)
                checkDuplicate = term
            elif(isinstance(term, DICT_WORD)):
                wordAdded = term
                checkDuplicate = term.word
            else:
                raise ValueError("[!] the term you want to update into dictionary should be str or "+
                                 "DICT_WORD type!")

            if(checkDuplicate not in have_add):
                have_add.add(checkDuplicate)
                root = self._addWord(root, wordAdded, incre_df=True, dictMerge = dictMerge)
            else:
                root = self._addWord(root, wordAdded, incre_df=False, dictMerge = dictMerge)

        self.updateIndex(root)
        return root

    def updateIndex(self, root, isRootCaller = True, initialIndex = -1):
        if not root:
            return
        self.updateIndex(root.left, isRootCaller = False)
        self.__initialIndex += 1
        root.val.tIndex = self.__initialIndex
        self.updateIndex(root.right, isRootCaller = False)

        if(isRootCaller):
            self.__initialIndex = -1

    def __plus(self, root, word:DICT_WORD, incre_df:bool = False, dictMerge:bool=False):
        if(isinstance(word, str)):
            word = DICT_WORD(word)
        if(not isinstance(word, DICT_WORD)):
            raise TypeError("[!] the type of word you want to increment should be str or DICT_WORD. ")

        if(not root):
            return

        if root.val == word:
            root.val += word

            if(incre_df):
                root.val.incre_df()
            if(dictMerge):
                root.val._decre_df()

        elif root.val > word:
            self.__plus(root.left, word, incre_df, dictMerge = dictMerge)
        else:
            self.__plus(root.right, word, incre_df, dictMerge = dictMerge)

    def getSpecificNodeValue(self, root, term):
        if(not super().search(root, term)):
            raise ValueError("[!] The term you request is not in the dict")

        if not root:
            return None
        elif term == root.val:
            return (root.val)#warn: check the copy of DICT_WORD

        elif term < root.val:
            return deepcopy(self.getSpecificNodeValue(root.left, term))
        else:
            return deepcopy(self.getSpecificNodeValue(root.right, term))

    def setSpecificNodeValue(self, root, term, value): # 還沒試過對不對
        if(not super().search(root, term)):
            raise ValueError("[!] The term you request is not in the dict")

        if not root:
            return None
        elif term == root.val:
            root.val = value
            return (root.val)#warn: check the copy of DICT_WORD

        elif term < root.val:
            return deepcopy(self.getSpecificNodeValue(root.left, term))
        else:
            return deepcopy(self.getSpecificNodeValue(root.right, term))


    def saveDictTree(self, root, FileName="dictionary.txt", sep=", ", end="\n"):
        result = self.inOrderGet(root)
        outputFile = open(FileName, 'w')
        outputFile.write("t_index{}term{}df{}".format(sep, sep, end))
        for i, dictWord in enumerate(result):
            outputFile.write("{}{}{}{}{}{}".format(dictWord.tIndex, sep, dictWord.word, sep, dictWord.tf, end))