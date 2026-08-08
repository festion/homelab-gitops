#!/usr/bin/env python3
"""
Tests for TemplateApplicator.apply_template()

Regression coverage for ops #2648: apply_template(..., dry_run=False) used to
silently fall back to the dry-run planner and report success, even though no
files were ever written. It must now raise NotImplementedError instead.
"""

import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).parent / "template-applicator.py"
spec = importlib.util.spec_from_file_location("template_applicator", MODULE_PATH)
template_applicator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(template_applicator)
TemplateApplicator = template_applicator.TemplateApplicator


class ApplyTemplateTests(unittest.TestCase):
    def setUp(self):
        self.template_path = Path(__file__).parent / "templates" / "standard-devops"
        self.repo_dir = Path(tempfile.mkdtemp(dir=str(Path(__file__).parent)))

    def tearDown(self):
        shutil.rmtree(self.repo_dir, ignore_errors=True)

    def test_apply_template_raises_when_not_dry_run(self):
        applicator = TemplateApplicator(dry_run=False)
        with self.assertRaises(NotImplementedError):
            applicator.apply_template(self.template_path, self.repo_dir)

    def test_apply_template_dry_run_still_returns_plan_unchanged(self):
        applicator = TemplateApplicator(dry_run=True)

        via_apply_template = applicator.apply_template(self.template_path, self.repo_dir)
        via_dry_run_directly = applicator.apply_template_dry_run(
            self.template_path, self.repo_dir
        )

        self.assertEqual(
            json.dumps(via_apply_template, sort_keys=True),
            json.dumps(via_dry_run_directly, sort_keys=True),
        )
        self.assertGreater(len(via_apply_template["files_to_create"]), 0)


if __name__ == "__main__":
    unittest.main()
