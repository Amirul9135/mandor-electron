from abc import ABC, abstractmethod 

class Macro(ABC): 
    # def __init__(self): 
    TYPE = {
        "COMMAND": 0,
        "CONDITION": 1,
        "LOOP": 2
    }
    def __init__(self) -> None:
        super().__init__()
        self.nodeId = None
     