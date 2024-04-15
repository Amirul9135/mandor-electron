from Model.Macro import Macro 

class Condition(Macro): 
    TYPE = {
        "COLOR_AT_COORD": 0,  # {val:colorhex,coord:{x,y},tolerance:10}
        "NUMBER": 1  # {val:fixedToCompare,counter:object.count()} object yg expose counter via function int/float whatever
    }

    COMPARE = {
        "IS_GREATER_THAN_VALUE": 0,
        "IS_GREATER_THAN_EQUAL_VALUE": 1,
        "IS_LESS_THAN_VALUE": 2,
        "IS_LESS_THAN_EQUAL_VALUE": 3,
        "IS_VALUE": 4,
        "IS_NOT_VALUE": 5
    }
 
    
    def __init__(self,type,comparison,value) -> None:
        super().__init__()    
        self.classCode = Macro.TYPE['CONDITION']
        self.type = type
        self.comparison = comparison
        self.value = value 
        self.childMacros = []
    
    @staticmethod
    def fromJSON(jobj):
        if(type(jobj['type']) != 'str'):
            jobj['type'] = int(jobj['type'])  
        if(type(jobj['comparison']) != 'str'):
            jobj['comparison'] = int(jobj['comparison'])  
        return Condition(jobj['type'],jobj['comparison'],jobj['value']) 
      