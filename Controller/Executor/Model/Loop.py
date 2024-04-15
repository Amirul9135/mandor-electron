from Model.Macro import Macro
from typing import List
from Model.Condition import Condition

class Loop(Macro): 
    
    def __init__(self,condition:Condition) -> None:
        super().__init__()     
        self.condition = condition 
        self.child:List[Macro] = []
     
    def toJSON(self):
        return {
            "type": Macro.CONDITION, 
            "condition":  self.condition,
            "child":  self.child
        }  
        
    def label(self):
        return  'Repeat until ' + self.condition.label()
    
    def execute(self):
        pass
