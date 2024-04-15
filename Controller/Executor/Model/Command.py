from Model.Macro import Macro

class Command(Macro): 
    

    TYPE = {
        'MOUSE_CLICK': 0,
        'KEYBOARD_PRESS': 2,
        'DELAY': 10
    }
    KEY = {
        'LMB': 'LMB',
        'RMB': 'RMB'
    }
        
    def __init__(self,key, type, duration = 0, coord = None) -> None:
        super().__init__()  
        self.classCode = Macro.TYPE['COMMAND']
        self.key = key
        self.duration = duration
        self.type = type
        self.coord = coord 
        
    @staticmethod
    def fromJSON(jobj):
        if(type(jobj['type']) != 'str'):
            jobj['type'] = int(jobj['type']) 
        try: 
            if(type(jobj['duration']) != 'str'):
                jobj['duration'] = int(jobj['duration']) 
        except:
            pass
        return Command(jobj['key'],jobj['type'],jobj['duration'],jobj['coord']) 
        
      
