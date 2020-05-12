'''
Python code to insert a node in AVL tree
This block of code is progamming based on the code from "https://www.geeksforgeeks.org/avl-tree-set-1-insertion/"
The code of the original AVL tree is contributed by Ajitesh Pathak
'''

# Generic tree node class
class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
        self.height = 1

# AVL tree class which supports the
# Insert operation

class AVL_Tree:
    # Recursive function to insert key in
    # subtree rooted with node and returns
    # new root of subtree.
    def insert(self, root, key):
        
        # Step 1 - Perform normal BST
        if not root:
            return TreeNode(key)
        elif key < root.val:
            root.left = self.insert(root.left, key)
        else:
            root.right = self.insert(root.right, key)

        # Step 2 - Update the height of the
        # ancestor node
        root.height = 1 + max(self.getHeight(root.left),
                           self.getHeight(root.right))

        # Step 3 - Get the balance factor
        balance = self.getBalance(root)

        # Step 4 - If the node is unbalanced,
        # then try out the 4 cases
        # Case 1 - Left Left
        if balance > 1 and key < root.left.val:
            return self.rightRotate(root)

        # Case 2 - Right Right
        if balance < -1 and key > root.right.val:
            return self.leftRotate(root)

        # Case 3 - Left Right
        if balance > 1 and key > root.left.val:
            root.left = self.leftRotate(root.left)
            return self.rightRotate(root)

        # Case 4 - Right Left
        if balance < -1 and key < root.right.val:
            root.right = self.rightRotate(root.right)
            return self.leftRotate(root)

        return root

    def leftRotate(self, z):

        y = z.right
        T2 = y.left

        # Perform rotation
        y.left = z
        z.right = T2

        # Update heights
        z.height = 1 + max(self.getHeight(z.left),
                         self.getHeight(z.right))
        y.height = 1 + max(self.getHeight(y.left),
                         self.getHeight(y.right))

        # Return the new root
        return y

    def rightRotate(self, z):

        y = z.left
        T3 = y.right

        # Perform rotation
        y.right = z
        z.left = T3

        # Update heights
        z.height = 1 + max(self.getHeight(z.left),
                        self.getHeight(z.right))
        y.height = 1 + max(self.getHeight(y.left),
                        self.getHeight(y.right))

        # Return the new root
        return y

    def getHeight(self, root):
        if not root:
            return 0

        return root.height

    def getBalance(self, root):
        if not root:
            return 0
        return self.getHeight(root.left) - self.getHeight(root.right)

    def inOrderGet(self, root, isRootCaller = True, getter = None):
        """Get the value of tree in the inorder traversal. """
        if not root:
            return

        if(isRootCaller):
            getter = []

        self.inOrderGet(root.left, isRootCaller = False, getter=getter)
        getter.append(root.val)
        self.inOrderGet(root.right, isRootCaller = False, getter=getter)
        return getter

    def search(self, root, key):
        #Yun's expansion
        if not root:
            return False
        elif key == root.val:
            return True

        elif key < root.val:
            return self.search(root.left, key)
        else:
            return self.search(root.right, key)

''' This is the code to test the above AVL Tree

    myTree = AVL_Tree()
    root = None
    root = myTree.insert(root, 10)
    root = myTree.insert(root, 20)
    root = myTree.insert(root, 30)
    root = myTree.insert(root, 40)
    root = myTree.insert(root, 50)
    root = myTree.insert(root, 25)

    """The constructed AVL Tree would be
                30
               /  \
             20   40
            /  \     \
           10  25    50"""

    # Preorder Traversal
    print("Inorder traversal of the constructed AVL tree is")
    tree = myTree.inOrderGet(root)
    for i in tree:
        print(i)
'''
