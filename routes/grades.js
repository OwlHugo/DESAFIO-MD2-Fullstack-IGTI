import express from 'express';
import { promises as fs, writeFile } from 'fs';

const router = express.Router();

//Adicionar grades
router.post('/', async (req, res) => {
  let grade = req.body;
  try {
    const json = JSON.parse(await fs.readFile(global.jsonGrades, 'utf-8'));

    grade = { id: json.nextId++, timestamp: new Date(), ...grade };
    json.grades.push(grade);

    await fs.writeFile(global.jsonGrades, JSON.stringify(json));

    res.send(grade);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});
//Put, atualizar grades
router.put('/', async (req, res) => {
  try {
    let newInfo = req.body;

    const json = JSON.parse(await fs.readFile(global.jsonGrades, 'utf-8'));

    let index = json.grades.findIndex((grade) => grade.id === newInfo.id);

    if (newInfo.student) {
      json.grades[index].student = newInfo.student;
    }
    if (newInfo.subject) {
      json.grades[index].subject = newInfo.subject;
    }
    if (newInfo.type) {
      json.grades[index].type = newInfo.type;
    }
    if (newInfo.value) {
      json.grades[index].value = newInfo.value;
    }

    await fs.writeFile(global.jsonGrades, JSON.stringify(json));

    res.send(json.grades[index]);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const json = JSON.parse(await fs.readFile(global.jsonGrades, 'utf-8'));

    let index = json.grades.findIndex(
      (grade) => grade.id === parseInt(req.params.id, 10)
    );
    if (index === -1) {
      throw new Error('Esse ID não existe!');
    }

    json.grades.splice(index, 1);

    await fs.writeFile(global.jsonGrades, JSON.stringify(json));

    res.end();
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//GET Grades by id.
router.get('/:id', async (req, res) => {
  try {
    let json = JSON.parse(await fs.readFile(global.jsonGrades, 'utf-8'));

    const grades = json.grades.find(
      (grade) => grade.id === parseInt(req.params.id, 10)
    );
    if (grades) {
      res.send(grades);
    } else {
      throw new Error('Esse ID não existe.');
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//POST and sum Grades with two props.
router.post('/allGrades', async (req, res) => {
  try {
    const json = JSON.parse(await fs.readFile(global.jsonGrades, 'utf-8'));

    const grades = json.grades.filter(
      (grade) =>
        grade.student === req.body.student && grade.subject === req.body.subject
    );

    let all = grades.reduce((acc, curr) => {
      return acc + curr.value;
    }, 0);
    res.send({ all });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//GET average Grades by params
router.get('/avgGrades/:subject/:type', async (req, res) => {
  try {
    const json = JSON.parse(await fs.readFile(global.jsonGrades, 'utf-8'));

    const grades = json.grades.filter(
      (grade) =>
        grade.type === req.params.type && grade.subject === req.params.subject
    );
    if (!grades.length) {
      throw new Error('Parâmetros sem registros ou não existentes.');
    }
    let all = grades.reduce((acc, curr) => {
      return acc + curr.value;
    }, 0);

    res.send({ avg: all / grades.length });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});
//POST best 3 Grades.
router.post('/goodGrades', async (req, res) => {
  try {
    const json = JSON.parse(await fs.readFile(global.jsonGrades, 'utf-8'));
    const grades = json.grades.filter(
      (grade) =>
        grade.type === req.body.type && grade.subject === req.body.subject
    );
    if (!grades.length) {
      throw new Error('Parâmetros sem registros ou não existentes.');
    }

    grades.sort((a, b) => {
      if (a.value < b.value) return 1;
      else if (a.value > b.value) return -1;
      else return 0;
    });
    res.send(grades.slice(0, 3));
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});
export default router;
