export function createBugController(service) {
  return {
    async create(req, res) {
      const data = await service.create(req.body);
      res.location(`/api/bugs/${data.id}`).status(201).json({ data });
    },
    async list(req, res) {
      res.json(await service.list(req.query));
    },
    async detail(req, res) {
      res.json({ data: await service.findById(req.params.id) });
    },
    async update(req, res) {
      res.json({ data: await service.update(req.params.id, req.body) });
    },
  };
}
