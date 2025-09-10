---
дата: 18-06-2024
время: 17:57
теги:
---

```c#
List<Discipline> disciplines = new List<Discipline>(){
	new Discipline(1,"a"),
	new Discipline(2,"b"),
	new Discipline(3,"c"),
	new Discipline(4,"d"),
	new Discipline(5,"e")
};
List<Supervisor> supervisors = new List<Supervisor>(){
	new (1, "Connor, Sara"),
	new (2, "Stallone, Silvestre")
};
List<SupervisorDiscipline> sd = new List<SupervisorDiscipline>(){
	new SupervisorDiscipline(1, 1),
	new SupervisorDiscipline(1, 2),
	new SupervisorDiscipline(2, 3),
	new SupervisorDiscipline(2, 5),
};

int sForDisplay = 2; // c, e

var discs = sd.Where(s => s.SupervisorId == sForDisplay).Select(d => d.DisciplineId);

var query = disciplines.Where(d => sd.Any(s => s.DisciplineId == d.Id && s.SupervisorId == sForDisplay));

query.Dump();

//-------------------------------------------------------------------------------------------
public class Discipline{
	public Discipline(int id, string title){
	Id = id;
	Title = title;
	} 
	public int Id {get; set;}
	public string Title {get; set;}
}

public class SupervisorDiscipline{
	public SupervisorDiscipline(int supervisorId, int disciplineId){
	SupervisorId = supervisorId;
	DisciplineId = disciplineId;
	} 
	public int SupervisorId {get; set;}
	public int DisciplineId {get; set;}
}
public class Supervisor{
	public Supervisor(int id, string fullName){
	Id = id;
	FullName = fullName;
	} 
	public int Id {get; set;}
	public string FullName {get; set;}
}
```