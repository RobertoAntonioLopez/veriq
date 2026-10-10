export function createTestRunController(service) {
  return {
    async create(req, res) {
      const data = await service.create(req.body);
      res.location(`/api/test-runs/${data.id}`).status(201).json({ data });
    },
    async list(req, res) {
      res.json(await service.list(req.query));
    },
    async detail(req, res) {
      res.json({ data: await service.findById(req.params.id) });
    },
  };
}
