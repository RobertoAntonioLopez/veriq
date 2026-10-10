export function createTestCaseController(service) {
  return {
    async list(req, res) {
      res.json(await service.list(req.query));
    },
    async detail(req, res) {
      res.json({ data: await service.findById(req.params.id) });
    },
    async create(req, res) {
      const data = await service.create(req.body);
      res.location(`/api/test-cases/${data.id}`).status(201).json({ data });
    },
    async update(req, res) {
      res.json({ data: await service.update(req.params.id, req.body) });
    },
    async remove(req, res) {
      await service.remove(req.params.id);
      res.status(204).end();
    },
  };
}
